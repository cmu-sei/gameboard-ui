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
import { PracticeChallengeListComponent } from '@/practice-challenge-list/practice-challenge-list.component';
import { PracticeSessionComponent } from './practice-session/practice-session.component';

@NgModule({
  declarations: [
    PracticePageComponent,
    PracticeChallengeListComponent,
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
          {
            path: ':cid', children: [
              { path: '**', component: PracticeSessionComponent }
            ]
          },
          { path: '', pathMatch: 'full', component: PracticeChallengeListComponent }
        ]
      }
    ])
  ]
})
export class PracModule { }
