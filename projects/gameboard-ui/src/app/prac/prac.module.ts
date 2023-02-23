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
import { PracticeModeEnabledGuard } from './practice-mode-enabled.guard';



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
      { path: ':gid/:cid', canActivate: [AuthGuard, PracticeModeEnabledGuard], component: PracticeSessionComponent },
      { path: ':gid', canActivate: [AuthGuard, PracticeModeEnabledGuard], component: PracticeSessionComponent },
      { path: '', canActivate: [PracticeModeEnabledGuard], canActivateChild: [PracticeModeEnabledGuard], component: PracticePageComponent },
    ])
  ]
})
export class PracModule { }
