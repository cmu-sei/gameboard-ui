// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { UtilityModule } from '../utility/utility.module';

import { AuthGuard } from '../utility/auth.guard';
import { ContinueToGameboardButtonComponent } from './components/continue-to-gameboard-button/continue-to-gameboard-button.component';
import { ExternalGameLinkBannerComponent } from './components/external-game-link-banner/external-game-link-banner.component';
import { ExternalGameLoadingPageComponent } from './pages/external-game-loading-page/external-game-loading-page.component';
import { ExternalGamePageComponent } from './pages/external-game-page/external-game-page.component';
import { ExternalGameGuard } from '@/guards/external-game.guard';
import { LateStartBannerComponent } from './components/late-start-banner/late-start-banner.component';
import { GameboardPageComponent } from './pages/gameboard-page/gameboard-page.component';
import { GameInfoComponent } from './game-info/game-info.component';
import { GameIsStarted } from '@/guards/game-is-started.guard';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GamespaceQuizComponent } from './gamespace-quiz/gamespace-quiz.component';
import { HubStateToPlayerStatusPipe } from './pipes/hub-state-to-player-status.pipe';
import { IndexToSubmittedAnswersPipe } from './pipes/index-to-submitted-answers.pipe';
import { PlayerEnrollComponent } from './player-enroll/player-enroll.component';
import { PlayerPresenceComponent } from './player-presence/player-presence.component';
import { PlayerSessionComponent } from './player-session/player-session.component';
import { SessionForecastComponent } from './session-forecast/session-forecast.component';
import { SessionStartControlsComponent } from './components/session-start-controls/session-start-controls.component';
import { SessionStartCountdownComponent } from './components/session-start-countdown/session-start-countdown.component';
import { TeamChallengeScoresToChallengeResultTypeCountPipe } from './pipes/team-challenge-scores-to-challenge-result-type-count.pipe';
import { UserIsPlayingGuard } from '@/guards/user-is-playing.guard';
import { ScoreboardModule } from '@/scoreboard/scoreboard.module';
import { HasPendingNamePipe } from './pipes/has-pending-name.pipe';
import { ChallengeQuestionsComponent } from "../standalone/games/components/challenge-questions/challenge-questions.component";
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SafeUrlPipe } from '@/standalone/core/pipes/safe-url.pipe';
import { ScoreboardPageComponent } from '@/scoreboard/components/scoreboard-page/scoreboard-page.component';
import { FeedbackSubmissionFormComponent } from "../feedback/components/feedback-submission-form/feedback-submission-form.component";
import { GameSessionAvailabilityWarningComponent } from "./components/game-session-availability-warning/game-session-availability-warning.component";

const MODULE_DECLARATIONS = [
  ContinueToGameboardButtonComponent,
  ExternalGameLoadingPageComponent,
  ExternalGameLinkBannerComponent,
  ExternalGamePageComponent,
  GameInfoComponent,
  GamePageComponent,
  GameboardPageComponent,
  GamespaceQuizComponent,
  HasPendingNamePipe,
  HubStateToPlayerStatusPipe,
  IndexToSubmittedAnswersPipe,
  LateStartBannerComponent,
  PlayerEnrollComponent,
  PlayerPresenceComponent,
  PlayerSessionComponent,
  SessionForecastComponent,
  SessionStartControlsComponent,
  SessionStartCountdownComponent,
  TeamChallengeScoresToChallengeResultTypeCountPipe,
];

@NgModule({
  declarations: [
    ...MODULE_DECLARATIONS
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'board/:playerId/:cid', canActivate: [AuthGuard, GameIsStarted, UserIsPlayingGuard], component: GameboardPageComponent },
      { path: 'board/:playerId', canActivate: [AuthGuard, GameIsStarted, UserIsPlayingGuard], component: GameboardPageComponent },
      { path: 'external/:gameId/start/:playerId', canActivate: [AuthGuard, UserIsPlayingGuard], component: ExternalGameLoadingPageComponent },
      { path: 'external/:gameId/:teamId', canActivate: [AuthGuard, UserIsPlayingGuard, ExternalGameGuard], component: ExternalGamePageComponent },
      { path: ":gameId/scoreboard", component: ScoreboardPageComponent },
      { path: ':id', component: GamePageComponent, children: [] }
    ]),
    CoreModule,
    UtilityModule,
    ScoreboardModule,
    // standalones
    ChallengeQuestionsComponent,
    ErrorDivComponent,
    FeedbackSubmissionFormComponent,
    SafeUrlPipe,
    SpinnerComponent,
    FeedbackSubmissionFormComponent,
    GameSessionAvailabilityWarningComponent
  ]
})
export class GameModule { }
