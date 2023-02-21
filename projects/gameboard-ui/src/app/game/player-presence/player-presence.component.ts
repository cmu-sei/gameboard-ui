// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { HubPlayer, Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';
import { PlayerAvatarSize } from '../../core/components/player-avatar/player-avatar.component';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../utility/user.service';

interface PlayerPresenceContext {
  hasTeammates: boolean,
  manager: HubPlayer | undefined;
  players: HubPlayer[];
  playerIsManager: boolean;
  teamAvatar: string[],
  teamName: string;
}

@Component({
  selector: 'app-player-presence',
  styleUrls: ['./player-presence.component.scss'],
  templateUrl: './player-presence.component.html',
})
export class PlayerPresenceComponent implements OnInit {
  @Input() player!: Player;
  @Output() onManagerPromoted = new EventEmitter<string>();

  protected avatarSize = PlayerAvatarSize.Medium;
  protected promoteIcon = faChevronCircleUp;
  protected ctx$?: Observable<PlayerPresenceContext | null>;

  private hubActorsSubscription: Subscription | null = null;

  constructor(
    private hub: NotificationService,
    private playerApi: PlayerService,
  ) { }


  ngOnInit(): void {
    this.ctx$ = this.hub.actors$.pipe(
      map(a => {
        const manager = a.find(a => a.isManager);
        const typedTeammates = a || [];

        return {
          hasTeammates: !!typedTeammates.filter(a => a.id !== this.player.id).length,
          manager: typedTeammates.find(a => a.isManager),
          players: typedTeammates,
          playerIsManager: !!manager && manager.id === this.player.id,
          teamAvatar: manager?.sponsorList || this.player.sponsorList,
          teamName: manager?.approvedName || this.player.approvedName || "",
        }
      })
    );
  }

  protected promoteToManager(playerId: string) {
    this.hub.state$.pipe(first()).subscribe(s => {
      if (!s.id) {
        throw new Error("Can't promote a manager while the hub is disconnected.");
      }
      this.playerApi.promoteToManager(s.id, playerId, { currentManagerPlayerId: this.player.id }).pipe(first()).subscribe(_ => {
        this.onManagerPromoted.emit(playerId);
      });
    });
  }
}
