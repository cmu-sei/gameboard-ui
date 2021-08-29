// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { asyncScheduler, scheduled, Subscription } from 'rxjs';
import { finalize, map, switchMap, zipAll } from 'rxjs/operators';
import { PlayerEnlistment } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-player-enlist',
  templateUrl: './player-enlist.component.html',
  styleUrls: ['./player-enlist.component.scss']
})
export class PlayerEnlistComponent implements OnInit {

  errors: any[] = [];

  constructor(
    route: ActivatedRoute,
    router: Router,
    usersvc: UserService,
    apiPlayer: PlayerService
  ) {
    const sub: Subscription = scheduled([
      route.params,
      usersvc.user$
    ], asyncScheduler).pipe(
      zipAll(),
      map(z => ({code: z[0]?.code, userId: z[1]?.id}) as PlayerEnlistment),
      switchMap(z => apiPlayer.enlist(z)),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => router.navigate(['/game', p.gameId]),
      err => this.errors.push(err)
    );
  }

  ngOnInit(): void {
  }

}
