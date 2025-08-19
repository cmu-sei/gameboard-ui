import { NgModule, inject } from '@angular/core';
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
import { SettingsComponent } from './components/settings/settings.component';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { UserDisplayNameEditorComponent } from './components/user-display-name-editor/user-display-name-editor.component';
import { ErrorDivComponent } from "@/standalone/core/components/error-div/error-div.component";

const DECLARED_COMPONENTS = [
  CertificatesComponent,
  CertificatePublishControlsComponent,
  CertificatePrinterComponent,
  CompetitiveCertificatesComponent,
  PracticeCertificatesComponent,
  ProfileEditorComponent,
  ProfileHistoryComponent,
  SettingsComponent,
  UserPageComponent
];

@NgModule({
  declarations: [...DECLARED_COMPONENTS],
  imports: [
    CommonModule,
    CoreModule,
    SponsorsModule,
    RouterModule.forChild([
      { path: ":userId/certificates/:playerMode/:awardedForEntityId", component: CertificatePrinterComponent, title: "Certificate" },
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
          { path: 'profile/history', component: ProfileHistoryComponent, canActivate: [AuthGuard], title: "History" },
          {
            path: 'settings',
            title: "Settings",
            component: SettingsComponent,
            canActivate: [() => {
              const permissionsService = inject(UserRolePermissionsService);
              return permissionsService.can("Admin_View");
            }]
          }
        ]
      },
    ]),
    // imported standalones
    SpinnerComponent,
    UserDisplayNameEditorComponent,
    ErrorDivComponent
  ]
})
export class UsersModule { }
