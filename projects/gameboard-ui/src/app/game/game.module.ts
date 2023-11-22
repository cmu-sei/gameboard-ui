// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { UnityModule } from '../unity/unity.module';
import { UtilityModule } from '../utility/utility.module';

import { AuthGuard } from '../utility/auth.guard';
import { CertificateComponent } from './certificate/certificate.component';
import { ChallengeDeployCountdownComponent } from './components/challenge-deploy-countdown/challenge-deploy-countdown.component';
import { ContinueToGameboardButtonComponent } from './components/continue-to-gameboard-button/continue-to-gameboard-button.component';
import { ExternalGameLinkBannerComponent } from './components/external-game-link-banner/external-game-link-banner.component';
import { ExternalGameLoadingPageComponent } from './pages/external-game-loading-page/external-game-loading-page.component';
import { ExternalGamePageComponent } from './pages/external-game-page/external-game-page.component';
import { ExternalSyncGameGuard } from '@/guards/external-sync-game.guard';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { GameboardPageComponent } from './pages/gameboard-page/gameboard-page.component';
import { GameInfoComponent } from './game-info/game-info.component';
import { GameIsStarted } from '@/guards/game-is-started.guard';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GamespaceQuizComponent } from './gamespace-quiz/gamespace-quiz.component';
import { HubStateToPlayerStatusPipe } from './pipes/hub-state-to-player-status.pipe';
import { PlayComponent } from './components/play/play.component';
import { PlayerEnrollComponent } from './player-enroll/player-enroll.component';
import { PlayerPresenceComponent } from './player-presence/player-presence.component';
import { PlayerSessionComponent } from './player-session/player-session.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { ScoreboardPageComponent } from './pages/scoreboard-page/scoreboard-page.component';
import { ScoreboardTableComponent } from './scoreboard-table/scoreboard-table.component';
import { ScoreboardTeamDetailModalComponent } from './components/scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { SessionForecastComponent } from './session-forecast/session-forecast.component';
import { SessionStartControlsComponent } from './components/session-start-controls/session-start-controls.component';
import { SessionStartCountdownComponent } from './components/session-start-countdown/session-start-countdown.component';
import { TeamChallengeScoresToChallengeResultTypeCountPipe } from './pipes/team-challenge-scores-to-challenge-result-type-count.pipe';
import { UserIsPlayingGuard } from '@/guards/user-is-playing.guard';
import { UnityBoardComponent } from '../unity/unity-board/unity-board.component';

const MODULE_DECLARATIONS = [
  CertificateComponent,
  ChallengeDeployCountdownComponent,
  ExternalGameLoadingPageComponent,
  ExternalGamePageComponent,
  FeedbackFormComponent,
  GameInfoComponent,
  GamePageComponent,
  GameboardPageComponent,
  GamespaceQuizComponent,
  HubStateToPlayerStatusPipe,
  PlayComponent,
  PlayerEnrollComponent,
  PlayerPresenceComponent,
  PlayerSessionComponent,
  SessionForecastComponent,
  SessionStartControlsComponent,
  ScoreboardPageComponent,
  ScoreboardTableComponent,
  PlayerPresenceComponent,
  FeedbackFormComponent,
  CertificateComponent,
  HubStateToPlayerStatusPipe,
  SessionStartControlsComponent,
  SessionStartCountdownComponent,
];

@NgModule({
  declarations: [
    ...MODULE_DECLARATIONS,
    ScoreboardComponent,
    TeamChallengeScoresToChallengeResultTypeCountPipe,
    ScoreboardTeamDetailModalComponent,
    ContinueToGameboardButtonComponent,
    ExternalGameLinkBannerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'board/:playerId/:cid', canActivate: [AuthGuard, GameIsStarted, UserIsPlayingGuard], component: GameboardPageComponent },
      { path: 'board/:playerId', canActivate: [AuthGuard, GameIsStarted, UserIsPlayingGuard], component: GameboardPageComponent },
      { path: 'external/:gameId/start/:playerId', canActivate: [AuthGuard, UserIsPlayingGuard], component: ExternalGameLoadingPageComponent },
      { path: 'unity-board/:gameId/:playerId/:teamId/:sessionExpirationTime', canActivate: [AuthGuard, UserIsPlayingGuard], component: UnityBoardComponent },
      { path: 'external/:gameId/:teamId', canActivate: [AuthGuard, UserIsPlayingGuard, ExternalSyncGameGuard], component: ExternalGamePageComponent },
      { path: 'scores/:id', component: ScoreboardPageComponent },
      { path: ':id', component: GamePageComponent, children: [] }
    ]),
    CoreModule,
    UtilityModule,
    UnityModule
  ],
  exports: [
    ChallengeDeployCountdownComponent,
    PlayComponent,
  ]
})
export class GameModule { }
