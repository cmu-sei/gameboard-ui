// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilityModule } from '../utility/utility.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { CoreModule } from '../core/core.module';
import { HubStateToPlayerStatusPipe } from './pipes/hub-state-to-player-status.pipe';
import { GameboardPerformanceSummaryComponent } from './components/gameboard-performance-summary/gameboard-performance-summary.component';
import { CumulativeTimeClockComponent } from './components/cumulative-time-clock/cumulative-time-clock.component';
import { SessionStartControlsComponent } from './components/session-start-controls/session-start-controls.component';
import { SyncStartPageComponent } from './components/sync-start-page/sync-start-page.component';
import { SyncStartGuard } from '../guards/sync-start.guard';
import { GameStartPageComponent } from './components/game-start-page/game-start-page.component';

const MODULE_DECLARATIONS = [
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
  HubStateToPlayerStatusPipe
];

@NgModule({
  declarations: [
    ...MODULE_DECLARATIONS,
    GameboardPerformanceSummaryComponent,
    CumulativeTimeClockComponent,
    SessionStartControlsComponent,
    SyncStartPageComponent,
    GameStartPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'board/:playerId/:cid', canActivate: [AuthGuard, SyncStartGuard], component: GameboardPageComponent },
      { path: 'board/:playerId', canActivate: [AuthGuard, SyncStartGuard], component: GameboardPageComponent },
      { path: ':gameId/start/:playerId', canActivate: [AuthGuard], component: GameStartPageComponent },
      { path: ':gameId/sync-start', canActivate: [AuthGuard, SyncStartGuard], component: SyncStartPageComponent },
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
    UnityModule
  ]
})
export class GameModule { }
