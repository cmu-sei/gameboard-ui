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

@NgModule({
  declarations: [
    PracticeChallengeListComponent,
    PracticeChallengeStateSummaryComponent,
    PracticePageComponent,
    PracticeSessionComponent,
    PracticeChallengeSolvedModalComponent,
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
          { path: ':specId/:slug', component: PracticeSessionComponent },
          { path: '', pathMatch: 'full', component: PracticeChallengeListComponent }
        ]
      }
    ]),
    GameModule,
  ]
})
export class PracModule { }
