// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { AdminGuard } from './utility/admin.guard';
import { AuthGuard } from './utility/auth.guard';

const routes: Routes = [
  // { path: '', component: HomePageComponent, pathMatch: 'full'},
  {
    path: 'admin',
    canLoad: [AuthGuard, AdminGuard], canActivate: [AuthGuard, AdminGuard], canActivateChild: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'game',
    // canLoad: [AdminGuard], canActivate: [AdminGuard], canActivateChild: [AdminGuard],
    loadChildren: () => import('./game/game.module').then(m => m.GameModule)
  },
  {
    path: 'score',
    // canLoad: [AdminGuard], canActivate: [AdminGuard], canActivateChild: [AdminGuard],
    loadChildren: () => import('./score/score.module').then(m => m.ScoreModule)
  },
  {
    path: 'prac',
    // canLoad: [AdminGuard], canActivate: [AdminGuard], canActivateChild: [AdminGuard],
    loadChildren: () => import('./prac/prac.module').then(m => m.PracModule)
  },
  {
    path: 'support',
    canLoad: [AuthGuard], canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    loadChildren: () => import('./support/support.module').then(m => m.SupportModule)
  },
  {
    path: '',
    // canLoad: [AdminGuard], canActivate: [AdminGuard], canActivateChild: [AdminGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  { path: '', component: HomePageComponent, pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
