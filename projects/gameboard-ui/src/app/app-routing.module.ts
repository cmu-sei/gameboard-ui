// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { AdminGuard } from './utility/admin.guard';
import { AuthGuard } from './utility/auth.guard';
import { GbTitleStrategy } from './services/gb-title-strategy';
import { practiceModeEnabledGuard } from './prac/practice-mode-enabled.guard';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { ConsoleLayoutComponent } from './layouts/console-layout/console-layout.component';
import { ConsolePageComponent } from './consoles/components/console-page/console-page.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "c",
        component: ConsoleLayoutComponent,
        children: [
          {
            path: "console",
            component: ConsolePageComponent,
            title: "Console"
          }
        ]
      },
      {
        path: "",
        component: AppLayoutComponent,
        children: [
          {
            path: 'admin',
            canActivate: [AuthGuard, AdminGuard], canActivateChild: [AuthGuard, AdminGuard],
            loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
          },
          {
            path: 'game',
            title: "Game",
            loadChildren: () => import('./game/game.module').then(m => m.GameModule)
          },
          {
            path: 'practice',
            canActivate: [practiceModeEnabledGuard], canActivateChild: [practiceModeEnabledGuard],
            loadChildren: () => import('./prac/prac.module').then(m => m.PracModule),
            title: "Practice"
          },
          {
            path: "user",
            title: "User",
            loadChildren: () => import("./users/users.module").then(m => m.UsersModule)
          },
          {
            path: 'support',
            canActivate: [AuthGuard], canActivateChild: [AuthGuard],
            loadChildren: () => import('./support/support.module').then(m => m.SupportModule)
          },
          {
            path: 'reports',
            canActivate: [AuthGuard], canActivateChild: [AuthGuard],
            loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
          },
          {
            path: '',
            loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
          },
          { path: '', component: HomePageComponent, pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    {
      provide: TitleStrategy,
      useClass: GbTitleStrategy,
    }
  ]
})
export class AppRoutingModule { }
