// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Team, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { GameSessionService } from '../../services/game-session.service';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnInit {
  @Input() id = '';
  @Output() onManageManualBonusesRequest = new EventEmitter<string>();
  @Output() onUnenrollRequest = new EventEmitter<string>();
  @Output() onResetSessionRequest = new EventEmitter<string>();

  team$!: Observable<Team>;
  team!: Team;
  canUnenroll = false;
  showRaw = false;
  statusText = "Loading your session...";
  faInfo = faInfoCircle;
  errors: any[] = [];

  protected isLoadingChallenges = false;

  constructor(
    private api: PlayerService,
    private sessionService: GameSessionService
  ) { }

  ngOnInit(): void {
    this.team$ = this.api.getTeam(this.id).pipe(
      tap(t => this.team = t),
      tap(t => this.canUnenroll = this.sessionService.canUnenrollSession(new TimeWindow(t.sessionBegin, t.sessionEnd)))
    );
  }

  extend(team: Team): void {
    this.api.updateSession({
      teamId: team.teamId,
      sessionEnd: team.sessionEnd
    }).subscribe(
      () => { },
      (err) => this.errors.push(err)
    );
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
