// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable, firstValueFrom } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Player, Team, TimeWindow } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { GameSessionService } from '@/services/game-session.service';
import { TeamAdminContextMenuSessionResetRequest } from '../components/team-admin-context-menu/team-admin-context-menu.component';
import { DateTime } from 'luxon';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ExtendTeamsModalComponent } from '../components/extend-teams-modal/extend-teams-modal.component';
import { GameService } from '@/api/game.service';

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

  protected isoDateExtension = "";
  protected durationExtensionInMinutes?: number;
  protected isExtending = false;
  protected isLoadingChallenges = false;

  constructor(
    private api: PlayerService,
    private gameService: GameService,
    private sessionService: GameSessionService,
    private modalService: ModalConfirmService,
  ) { }

  ngOnInit(): void {
    this.team$ = this.api.getTeam(this.player.teamId).pipe(
      tap(t => this.team = t),
      tap(t => this.canUnenroll = this.sessionService.canUnenrollSession(new TimeWindow(t.sessionBegin, t.sessionEnd))),
      tap(t => {
        t.sessionBegin = new Date(t.sessionBegin);
        t.sessionEnd = new Date(t.sessionEnd);
        this.isoDateExtension = t.sessionEnd.toISOString();
      })
    );
  }

  // extend by ISO timestamp
  async extend(team: Team): Promise<void> {
    const friendlySessionEnd = DateTime.fromISO(this.isoDateExtension);
    const extensionDuration = friendlySessionEnd.diffNow("minutes");
    await this.extendByDuration(team, Math.floor(extensionDuration.minutes));
  }

  async extendByDuration(team: Team, extensionInMinutes?: number) {
    if (!extensionInMinutes) {
      return;
    }

    const game = await firstValueFrom(this.gameService.retrieve(team.gameId));

    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        extensionInMinutes: extensionInMinutes,
        game: {
          id: team.gameId,
          name: game.name,
          isTeamGame: game.isTeamGame
        },
        teamIds: [team.teamId]
      },
      modalClasses: ["modal-lg"]
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
