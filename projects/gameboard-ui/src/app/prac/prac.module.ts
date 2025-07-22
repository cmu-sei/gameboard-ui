import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ApiModule } from '@/api/api.module';
import { CoreModule } from '@/core/core.module';
import { GameModule } from '@/game/game.module';
import { UtilityModule } from '../utility/utility.module';

import { PracticePageComponent } from './components/practice-page/practice-page.component';
import { PracticeChallengeListComponent } from './components/practice-challenge-list/practice-challenge-list.component';
import { PracticeSessionComponent } from './components/practice-session/practice-session.component';
import { PracticeChallengeStateSummaryComponent } from './components/practice-challenge-state-summary/practice-challenge-state-summary.component';
import { PracticeChallengeSolvedModalComponent } from './components/practice-challenge-solved-modal/practice-challenge-solved-modal.component';
import { SuggestedSearchesComponent } from './components/suggested-searches/suggested-searches.component';
import { PlayComponent } from '@/standalone/games/components/play/play.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { EpochMsToTimeRemainingStringPipe } from '@/standalone/core/pipes/epoch-ms-to-time-remaining.pipe';
import { EpochMsToMsRemainingPipe } from '@/standalone/core/pipes/epoch-ms-to-ms-remaining.pipe';
import { InfoBubbleComponent } from '@/standalone/core/components/info-bubble/info-bubble.component';
import { FeedbackSubmissionFormComponent } from "../feedback/components/feedback-submission-form/feedback-submission-form.component";
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';
import { ToPracticeCertificateLinkPipe } from './pipes/to-practice-certificate-link.pipe';
import { UserPracticeSummaryComponent } from './components/user-practice-summary/user-practice-summary.component';

@NgModule({
  declarations: [
    PracticeChallengeListComponent,
    PracticeChallengeStateSummaryComponent,
    PracticePageComponent,
    PracticeSessionComponent,
    PracticeChallengeSolvedModalComponent,
    SuggestedSearchesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    UtilityModule,
    ApiModule,
    MarkdownModule,
    RouterModule.forChild([
      {
        path: "", component: PracticePageComponent, children: [
          { path: ":specId/:slug", component: PracticeSessionComponent },
          { path: "", pathMatch: 'full', component: PracticeChallengeListComponent }
        ]
      }
    ]),
    GameModule,
    // standalones
    EpochMsToMsRemainingPipe,
    EpochMsToTimeRemainingStringPipe,
    FeedbackSubmissionFormComponent,
    ErrorDivComponent,
    InfoBubbleComponent,
    PlayComponent,
    PluralizerPipe,
    SpinnerComponent,
    ToPracticeCertificateLinkPipe,
    UserPracticeSummaryComponent
  ]
})
export class PracModule { }
