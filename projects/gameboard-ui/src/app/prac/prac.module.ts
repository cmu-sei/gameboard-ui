import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilityModule } from '../utility/utility.module';
import { CoreModule } from '../core/core.module';
import { ApiModule } from '../api/api.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

import { PracticePageComponent } from './practice-page/practice-page.component';
import { PracticeChallengeListComponent } from './practice-challenge-list/practice-challenge-list.component';
import { PracticeSessionComponent } from './practice-session/practice-session.component';
import { GameModule } from '@/game/game.module';
import { PracticeChallengeStateSummaryComponent } from './practice-challenge-state-summary/practice-challenge-state-summary.component';
import { PracticeCardComponent } from './components/practice-card/practice-card.component';

@NgModule({
  declarations: [
    PracticeCardComponent,
    PracticeChallengeListComponent,
    PracticeChallengeStateSummaryComponent,
    PracticePageComponent,
    PracticeSessionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    UtilityModule,
    ApiModule,
    MarkdownModule,
    FontAwesomeModule,
    RouterModule.forChild([
      {
        path: "", component: PracticePageComponent, children: [
          { path: ':cid/:slug', component: PracticeSessionComponent },
          { path: '', pathMatch: 'full', component: PracticeChallengeListComponent }
        ]
      }
    ]),
    GameModule,
  ],
  exports: [
    PracticeCardComponent
  ]
})
export class PracModule { }
