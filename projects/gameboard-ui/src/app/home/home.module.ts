// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { RouterModule } from '@angular/router';
import { OidcComponent } from './oidc/oidc.component';
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
import { ProfileHistoryComponent } from '../users/components/profile-history/profile-history.component';

@NgModule({
  declarations: [
    HomePageComponent,
    OidcComponent,
    NewsComponent,
    LandingComponent,
    ForbiddenComponent,
    LoginPageComponent,
    TocPageComponent,
    ProfileHistoryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '', component: HomePageComponent, children: [
          { path: '', pathMatch: 'full', redirectTo: '/home' },
          { path: 'login', component: LoginPageComponent },
          { path: 'oidc', component: OidcComponent },
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
