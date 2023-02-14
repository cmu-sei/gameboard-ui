// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilityModule } from '../utility/utility.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerEnlistComponent } from './player-enlist/player-enlist.component';
import { AuthGuard } from '../utility/auth.guard';
import { PlayerEnrollComponent } from './player-enroll/player-enroll.component';
import { GameInfoComponent } from './game-info/game-info.component';
import { PlayerSessionComponent } from './player-session/player-session.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { GamePageComponent } from './game-page/game-page.component';
import { GameboardPageComponent } from './gameboard-page/gameboard-page.component';
import { GamespaceQuizComponent } from './gamespace-quiz/gamespace-quiz.component';
import { MarkdownModule } from 'ngx-markdown';
import { SessionForecastComponent } from './session-forecast/session-forecast.component';
import { ScoreboardPageComponent } from './scoreboard-page/scoreboard-page.component';
import { ScoreboardTableComponent } from './scoreboard-table/scoreboard-table.component';
import { PlayerPresenceComponent } from './player-presence/player-presence.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CertificateComponent } from './certificate/certificate.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { UnityModule } from '../unity/unity.module';
import { UnityBoardComponent } from '../unity/unity-board/unity-board.component';
import { GameHubStatusComponent } from './game-hub-status/game-hub-status.component';
import { CoreModule } from '../core/core.module';
import { PlayerStatusComponent } from './player-status/player-status.component';
import { HubStateToPlayerStatusPipe } from './pipes/hub-state-to-player-status.pipe';


@NgModule({
  declarations: [
    PlayerEnlistComponent,
    PlayerEnrollComponent,
    GameInfoComponent,
    PlayerSessionComponent,
    GamePageComponent,
    GameboardPageComponent,
    GamespaceQuizComponent,
    SessionForecastComponent,
    ScoreboardPageComponent,
    ScoreboardTableComponent,
    PlayerPresenceComponent,
    FeedbackFormComponent,
    CertificateComponent,
    GameHubStatusComponent,
    PlayerStatusComponent,
    HubStateToPlayerStatusPipe
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'teamup/:code', canActivate: [AuthGuard], component: PlayerEnlistComponent },
      { path: 'board/:id', canActivate: [AuthGuard], component: GameboardPageComponent },
      { path: 'unity-board/:gameId/:playerId/:teamId/:sessionExpirationTime', canActivate: [AuthGuard], component: UnityBoardComponent },
      { path: 'scores/:id', component: ScoreboardPageComponent },
      { path: ':id', component: GamePageComponent, children: [] }
    ]),
    CoreModule,
    UtilityModule,
    FontAwesomeModule,
    AlertModule,
    MarkdownModule,
    ButtonsModule,
    ModalModule,
    BsDropdownModule,
    UnityModule,
  ]
})
export class GameModule { }
