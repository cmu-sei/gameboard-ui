// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { faCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { ApiUser } from '../../api/user-models';
import { PlayerAvatarSize } from '../../core/components/player-avatar/player-avatar.component';
import { HubState, NotificationService } from '../../utility/notification.service';
import { UserService } from '../../utility/user.service';
import { GameHubStatus } from '../game-hub-status/game-hub-status.component';

@Component({
  selector: 'app-player-presence',
  templateUrl: './player-presence.component.html',
  styleUrls: ['./player-presence.component.scss']
})
export class PlayerPresenceComponent implements OnChanges, OnDestroy {
  @Input() id = '';
  refresh$ = new Subject<string>();
  hubState$: Observable<HubState>;
  user$: BehaviorSubject<ApiUser | null>;
  faDot = faCircle;
  faStar = faStar;
  gameHubStatus = GameHubStatus.Disconnected;

  protected avatarSize = PlayerAvatarSize.Small;

  private gameStatusSubscription$: Subscription | null = null;

  constructor(
    private hub: NotificationService,
    private userSvc: UserService
  ) {

    this.hubState$ = this.hub.state$;
    this.user$ = this.userSvc.user$;

    this.gameStatusSubscription$ = this.hub.state$.subscribe(state => {
      this.gameHubStatus = state.connected ? GameHubStatus.Connected : GameHubStatus.Disconnected;
    })
  }

  ngOnDestroy(): void {
    if (this.gameStatusSubscription$) {
      this.gameStatusSubscription$.unsubscribe();
      this.gameStatusSubscription$ = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.id) {
      this.refresh$.next(changes.id.currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.refresh$.next(this.id);
  }
}
