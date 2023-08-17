// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { RouterModule } from '@angular/router';
import { OidcComponent } from './oidc/oidc.component';
import { ProfileComponent } from './profile/profile.component';
import { NewsComponent } from './news/news.component';
import { LandingComponent } from './landing/landing.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UtilityModule } from '../utility/utility.module';
import { CoreModule } from '../core/core.module';
import { LoginPageComponent } from './login-page/login-page.component';
import { MarkdownModule } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../utility/auth.guard';
import { TocPageComponent } from './toc-page/toc-page.component';
import { CompetitiveCertificatesComponent } from './competitive-certificates/competitive-certificates.component';
import { ProfileHistoryComponent } from './profile-history/profile-history.component';
import { PracticeCertificatesComponent } from './practice-certificates/practice-certificates.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { practiceModeEnabledGuard } from '@/prac/practice-mode-enabled.guard';

@NgModule({
  declarations: [
    HomePageComponent,
    OidcComponent,
    ProfileComponent,
    NewsComponent,
    LandingComponent,
    ForbiddenComponent,
    LoginPageComponent,
    TocPageComponent,
    CompetitiveCertificatesComponent,
    ProfileHistoryComponent,
    PracticeCertificatesComponent,
    CertificatesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '', component: HomePageComponent, children: [
          { path: '', pathMatch: 'full', redirectTo: '/home' },
          { path: 'login', component: LoginPageComponent },
          { path: 'oidc', component: OidcComponent },
          { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], title: "Profile" },
          {
            path: 'profile/certificates', component: CertificatesComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [
              { path: 'competitive', component: CompetitiveCertificatesComponent, title: "Certificates" },
              { path: 'practice', component: PracticeCertificatesComponent, title: "Practice Certificates", canActivate: [practiceModeEnabledGuard] },
              { path: '', pathMatch: 'full', redirectTo: 'competitive' }
            ]
          },
          { path: 'profile/history', component: ProfileHistoryComponent, canActivate: [AuthGuard] },
          { path: 'doc/:id', component: TocPageComponent },
          { path: 'forbidden', component: ForbiddenComponent },
          { path: 'home', component: LandingComponent }
        ]
      },
      { path: '**', redirectTo: '/home' }
    ]),
    FormsModule,
    CoreModule,
    UtilityModule,
    FontAwesomeModule,
    MarkdownModule
  ]
})
export class HomeModule { }
