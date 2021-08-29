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
import { LoginPageComponent } from './login-page/login-page.component';
import { MarkdownModule } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../utility/auth.guard';



@NgModule({
  declarations: [
    HomePageComponent,
    OidcComponent,
    ProfileComponent,
    NewsComponent,
    LandingComponent,
    ForbiddenComponent,
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomePageComponent, children: [
        { path: '', pathMatch: 'full', redirectTo: '/home' },
        { path: 'login', component: LoginPageComponent },
        { path: 'oidc', component: OidcComponent },
        { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
        { path: 'news', component: NewsComponent },
        { path: 'forbidden', component: ForbiddenComponent },
        { path: 'home', component: LandingComponent }
      ]},
      { path: '**', redirectTo: '/home' }
    ]),
    FormsModule,
    UtilityModule,
    FontAwesomeModule,
    MarkdownModule
  ]
})
export class HomeModule { }
