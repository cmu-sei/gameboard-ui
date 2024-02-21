// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable, firstValueFrom } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Player, Team, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { GameSessionService } from '../../services/game-session.service';
import { TeamAdminContextMenuSessionResetRequest } from '../components/team-admin-context-menu/team-admin-context-menu.component';
import { TeamService } from '@/api/team.service';
import { ToastService } from '@/utility/services/toast.service';
import { DateTime } from 'luxon';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

@Component({
  selector: 'app-admin-player-session',
  templateUrl: './admin-player-session.component.html',
  styleUrls: ['./admin-player-session.component.scss']
})
export class PlayerSessionComponent implements OnInit {
  @Input() player!: Player;
  @Output() onManageManualBonusesRequest = new EventEmitter<string>();
  @Output() onUnenrollRequest = new EventEmitter<string>();
  @Output() onResetSessionRequest = new EventEmitter<TeamAdminContextMenuSessionResetRequest>();

  team$!: Observable<Team>;
  team!: Team;
  canUnenroll = false;
  showRaw = false;
  statusText = "Loading your session...";
  faInfo = faInfoCircle;
  protected errors: any[] = [];

  protected dateExtension = "";
  protected durationExtensionInMinutes?: number;
  protected isExtending = false;
  protected isLoadingChallenges = false;

  constructor(
    private api: PlayerService,
    private friendlyDatesAndTimes: FriendlyDatesService,
    private sessionService: GameSessionService,
    private modalService: ModalConfirmService,
    private teamService: TeamService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.team$ = this.api.getTeam(this.player.teamId).pipe(
      tap(t => this.team = t),
      tap(t => this.canUnenroll = this.sessionService.canUnenrollSession(new TimeWindow(t.sessionBegin, t.sessionEnd))),
      tap(t => {
        t.sessionBegin = new Date(t.sessionBegin);
        t.sessionEnd = new Date(t.sessionEnd);
        this.dateExtension = t.sessionEnd.toISOString();
      })
    );
  }

  async extend(team: Team): Promise<void> {
    try {
      this.isExtending = true;
      this.team.sessionEnd = new Date(this.dateExtension);
      await firstValueFrom(this.teamService.extendSession({ teamId: team.teamId, sessionEnd: team.sessionEnd }));

      const friendlySessionEnd = DateTime.fromISO(team.sessionEnd.toString());
      this.toastService.showMessage(`Team session extended to ${friendlySessionEnd.toLocaleString(DateTime.DATETIME_FULL)}.`);
    }
    catch (err: any) {
      this.errors.push(err);
    }

    this.isExtending = false;
  }

  async extendByDuration(team: Team, extensionInMinutes?: number) {
    if (!extensionInMinutes || extensionInMinutes < 0) {
      return;
    }

    const oldSessionEndDateTime = DateTime.fromJSDate(new Date(team.sessionEnd));
    const newSessionEndDateTime = oldSessionEndDateTime.plus({ minutes: extensionInMinutes });

    this.modalService.openConfirm({
      title: "Session Extension",
      bodyContent: `Are you sure you want to extend **${team.approvedName}**'s session by **${extensionInMinutes}** minutes? Their new end time will be **${this.friendlyDatesAndTimes.toFriendlyDateAndTime(newSessionEndDateTime.toJSDate())}** (local time).`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        if (newSessionEndDateTime.diffNow().toMillis() < 0) {
          this.toastService.showMessage("Can't extend session: new endtime is before now.");
          return;
        }

        await firstValueFrom(this.teamService.extendSession({ teamId: team.teamId, sessionEnd: newSessionEndDateTime.toUTC().toJSDate() }));
        this.toastService.showMessage(`Extended team ${team.approvedName}'s session by ${extensionInMinutes} minutes.`);

        this.durationExtensionInMinutes = undefined;
        this.dateExtension = newSessionEndDateTime.toUTC().toISO();
      }
    });
  }

  toggleRawView(isExpanding: boolean): void {
    if (isExpanding) {
      this.team.challenges = [];
      this.isLoadingChallenges = true;

      this.api.getTeamChallenges(this.team.teamId)
        .pipe(first())
        .subscribe(c => {
          this.team.challenges = c;
          this.isLoadingChallenges = false;
        });
    }

    this.showRaw = isExpanding;
  }
}
