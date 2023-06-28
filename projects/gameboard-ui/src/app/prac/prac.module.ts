import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PracticeSessionComponent } from './practice-session/practice-session.component';
import { UtilityModule } from '../utility/utility.module';
import { PracticePageComponent } from './practice-page/practice-page.component';
import { CoreModule } from '../core/core.module';
import { ApiModule } from '../api/api.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    PracticePageComponent,
    PracticeSessionComponent
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
        path: ':cid', children: [
          { path: '**', component: PracticeSessionComponent }
        ]
      },
      { path: '', pathMatch: 'full', component: PracticePageComponent }
    ])
  ]
})
export class PracModule { }
