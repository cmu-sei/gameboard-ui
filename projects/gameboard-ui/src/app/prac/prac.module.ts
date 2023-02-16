import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../utility/auth.guard';
import { PracticeSessionComponent } from './practice-session/practice-session.component';
import { UtilityModule } from '../utility/utility.module';
import { PracticePageComponent } from './practice-page/practice-page.component';
import { CoreModule } from '../core/core.module';
import { ApiModule } from '../api/api.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';



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
    FontAwesomeModule,
    RouterModule.forChild([
      { path: ':gid/:cid', canActivate: [AuthGuard], component: PracticeSessionComponent },
      { path: ':gid', canActivate: [AuthGuard], component: PracticeSessionComponent },
      { path: '', component: PracticePageComponent },
    ])
  ]
})
export class PracModule { }
