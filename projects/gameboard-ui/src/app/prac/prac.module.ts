import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ApiModule } from '@/api/api.module';
import { CoreModule } from '@/core/core.module';
import { UtilityModule } from '../utility/utility.module';

import { ChallengeGroupComponent } from './components/challenge-group/challenge-group.component';
import { ChallengeGroupsComponent } from './components/challenge-groups/challenge-groups.component';
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
import { PracticeTabsLayoutComponent } from './components/practice-tabs-layout/practice-tabs-layout.component';

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
        // the practice page layout adds the little widget in the upper right
        // that shows the player's active practice challenge
        path: "", component: PracticePageComponent, children: [
          {
            // the tabs layout (which shows "challenges" and "collections") is visible
            // throughout most of the practice area, but we allow the screen where they actually
            // play to break out of it because it takes advantage of more width if the client
            // resolution has it
            path: "",
            component: PracticeTabsLayoutComponent,
            children: [
              {
                path: "challenges",
                children: [
                  { path: "", pathMatch: "full", component: PracticeChallengeListComponent, title: "Challenges" }
                ]
              },
              { path: "collections/:id", component: ChallengeGroupComponent, title: "Collection" },
              { path: "collections", component: ChallengeGroupsComponent, title: "Collections" },
              { path: "", pathMatch: 'full', redirectTo: "challenges" }
            ]
          },
          { path: "challenges/:specId/:slug", component: PracticeSessionComponent },
          { path: "challenges/:specId", component: PracticeSessionComponent },
          { path: ":specId/:slug", redirectTo: "challenges/:specId/:slug" },
          { path: ":specId", redirectTo: "challenges/:specId" }
        ]
      }
    ]),
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
