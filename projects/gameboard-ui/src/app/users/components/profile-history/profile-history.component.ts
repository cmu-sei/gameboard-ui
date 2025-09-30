// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Player } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { UserService } from '../../../utility/user.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

@Component({
    selector: 'app-profile-history',
    templateUrl: './profile-history.component.html',
    styleUrls: ['./profile-history.component.scss'],
    standalone: false
})
export class ProfileHistoryComponent {
  list$: Observable<Player[]>;

  constructor(
    userSvc: UserService,
    api: PlayerService
  ) {
    this.list$ = userSvc.user$.pipe(
      map(u => u?.id),
      filter(id => !!id),
      switchMap(uid => api.list({ uid, sort: 'time' }))
    );
  }
}
