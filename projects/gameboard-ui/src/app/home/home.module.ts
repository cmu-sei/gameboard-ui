// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { RouterModule } from '@angular/router';
import { OidcComponent } from './oidc/oidc.component';
import { LandingComponent } from './landing/landing.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { UtilityModule } from '../utility/utility.module';
import { CoreModule } from '../core/core.module';
import { LoginPageComponent } from './login-page/login-page.component';
import { TocPageComponent } from './toc-page/toc-page.component';
import { RegistrationTypeToIsOpenPipe } from './pipes/registration-type-to-is-open.pipe';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

@NgModule({
  declarations: [
    HomePageComponent,
    OidcComponent,
    LandingComponent,
    ForbiddenComponent,
    LoginPageComponent,
    TocPageComponent,
    RegistrationTypeToIsOpenPipe,
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
    CoreModule,
    UtilityModule,

    // standalones
    ErrorDivComponent,
    SpinnerComponent
  ]
})
export class HomeModule { }
