import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@/core/core.module';
import { CertificatePrinterComponent } from './components/certificate-printer/certificate-printer.component';
import { RouterModule } from '@angular/router';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { CompetitiveCertificatesComponent } from './components/competitive-certificates/competitive-certificates.component';
import { PracticeCertificatesComponent } from './components/practice-certificates/practice-certificates.component';
import { AuthGuard } from '@/utility/auth.guard';
import { practiceModeEnabledGuard } from '@/prac/practice-mode-enabled.guard';
import { CertificatePublishControlsComponent } from './components/certificate-publish-controls/certificate-publish-controls.component';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { ProfileHistoryComponent } from './components/profile-history/profile-history.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { SponsorsModule } from '@/sponsors/sponsors.module';

const DECLARED_COMPONENTS = [
  CertificatesComponent,
  CertificatePublishControlsComponent,
  CertificatePrinterComponent,
  CompetitiveCertificatesComponent,
  PracticeCertificatesComponent,
  ProfileEditorComponent
];

@NgModule({
  declarations: [...DECLARED_COMPONENTS, UserPageComponent],
  imports: [
    CommonModule,
    CoreModule,
    SponsorsModule,
    RouterModule.forChild([
      { path: ":userId/certificates/:playerMode/:awardedForEntityId", component: CertificatePrinterComponent },
      {
        path: '',
        component: UserPageComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
          {
            path: 'certificates', component: CertificatesComponent, title: "Certificates", canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [
              { path: 'competitive', component: CompetitiveCertificatesComponent, title: "Competitive Certificates" },
              { path: 'practice', component: PracticeCertificatesComponent, title: "Practice Certificates", canActivate: [practiceModeEnabledGuard] },
              { path: '', pathMatch: 'full', redirectTo: 'competitive' }
            ]
          },
          { path: 'profile', component: ProfileEditorComponent, title: "Profile" },
          { path: 'profile/history', component: ProfileHistoryComponent, canActivate: [AuthGuard] },
        ]
      },
    ]),
  ]
})
export class UsersModule { }
