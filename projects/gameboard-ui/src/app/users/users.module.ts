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

const DECLARED_COMPONENTS = [
  CertificatesComponent,
  CertificatePrinterComponent,
  CompetitiveCertificatesComponent,
  PracticeCertificatesComponent,
];

@NgModule({
  declarations: [...DECLARED_COMPONENTS],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([
      {
        path: 'certificates', component: CertificatesComponent, title: "Certificates", canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [
          { path: 'competitive', component: CompetitiveCertificatesComponent, title: "Competitive Certificates" },
          { path: 'practice', component: PracticeCertificatesComponent, title: "Practice Certificates", canActivate: [practiceModeEnabledGuard] },
          { path: '', pathMatch: 'full', redirectTo: 'competitive' }
        ]
      },
      { path: ":userId/certificates/:challengeSpecId", component: CertificatePrinterComponent },
    ]),
  ]
})
export class UsersModule { }
