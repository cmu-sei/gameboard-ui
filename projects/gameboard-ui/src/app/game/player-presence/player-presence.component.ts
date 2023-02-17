// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { HubPlayer, Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';
import { PlayerAvatarSize } from '../../core/components/player-avatar/player-avatar.component';
import { HubState, NotificationService } from '../../services/notification.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-player-presence',
  styleUrls: ['./player-presence.component.scss'],
  templateUrl: './player-presence.component.html',
})
export class PlayerPresenceComponent implements OnChanges, OnInit, OnDestroy {
  @Input() player!: Player;
  @Output() onManagerPromoted = new EventEmitter<string>();

  leaderAvatar$ = new BehaviorSubject<string[]>([]);
  refresh$ = new Subject<string>();
  hasTeammates$ = new BehaviorSubject<boolean>(false);
  isManager$ = new BehaviorSubject<boolean>(false);
  user$: BehaviorSubject<ApiUser | null>;

  protected avatarSize = PlayerAvatarSize.Medium;
  protected promoteIcon = faChevronCircleUp;

  protected actors$: Observable<HubPlayer[]>;
  protected hubState$: Observable<HubState>;

  private leaderAvatarSubscription: Subscription;
  private hubActorsSubscription: Subscription | null = null;

  constructor(
    private hub: NotificationService,
    private playerApi: PlayerService,
    private userSvc: UserService
  ) {
    this.actors$ = this.hub.actors$.pipe(tap(a => this.resolveIsManager(this.player.id)));
    this.hubState$ = this.hub.state$;
    this.user$ = this.userSvc.user$;

    this.leaderAvatarSubscription = this.hub.actors$.pipe(
      filter(a => !!this.player?.teamId),
      switchMap(h => this.playerApi.getTeam(this.player.teamId))
    ).subscribe(team => {
      this.leaderAvatar$.next(team.sponsorList);
    });
  }

  ngOnInit(): void {
    this.leaderAvatar$.next(this.player.sponsorList);
    this.hubActorsSubscription = this.hub.actors$.subscribe(a => this.evaluateHasTeammates(a))
  }

  ngOnDestroy(): void {
    this.hubActorsSubscription?.unsubscribe();
    this.leaderAvatarSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.id) {
      this.refresh$.next(changes.id.currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.refresh$.next(this.player.id);
  }

  private evaluateHasTeammates(actors: HubPlayer[]) {
    if (!actors?.length) {
      this.hasTeammates$.next(false);
      return;
    }

    this.hasTeammates$.next(actors.some(a => a.userId !== this.player.userId));
  }

  private resolveIsManager(playerId: string) {
    this.playerApi.retrieve(playerId).pipe(first())
      .subscribe(p => this.isManager$.next(p.isManager));
  }

  protected promoteToManager(playerId: string) {
    this.hubState$.pipe(first()).subscribe(s => {
      if (!s.id) {
        throw new Error("Can't promote a manager while the hub is disconnected.");
      }
      this.playerApi.promoteToManager(s.id, playerId, { currentManagerPlayerId: this.player.id }).pipe(first()).subscribe(_ => {
        this.onManagerPromoted.emit(playerId);
      });
    });
  }
}
