// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { HubPlayer, Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { PlayerAvatarSize } from '../../core/components/player-avatar/player-avatar.component';
import { NotificationService } from '../../services/notification.service';

interface PlayerPresenceContext {
  hasTeammates: boolean;
  manager: HubPlayer | undefined;
  allPlayers: HubPlayer[];
  player: HubPlayer;
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
  @Input() player$?: Observable<Player | undefined>;
  @Output() onManagerPromoted = new EventEmitter<string>();

  protected avatarSize = PlayerAvatarSize.Medium;
  protected promoteIcon = faChevronCircleUp;
  protected ctx$?: Observable<PlayerPresenceContext | null>;
  protected avatarUris: string[] = [];

  constructor(
    private hub: NotificationService,
    private playerApi: PlayerService,
  ) { }

  ngOnInit(): void {
    this.ctx$ = combineLatest([
      this.hub.actors$,
      this.player$
    ]).pipe(
      map(thing => thing as unknown as { 0: HubPlayer[], 1: HubPlayer }),
      map(thing => ({ actors: thing[0], player: thing[1] })),
      map(context => {
        if (!context.player) {
          return null;
        }
        const actorInfo = this.findPlayerAndTeammates(context.player, context.actors);
        this.avatarUris = actorInfo.allPlayers.map(p => p.sponsorLogo);

        return {
          hasTeammates: !!actorInfo.teammates.length,
          manager: actorInfo.manager,
          allPlayers: actorInfo.allPlayers,
          player: actorInfo.player,
          playerIsManager: !!actorInfo.manager && actorInfo.manager.id === actorInfo.player?.id,
          teamAvatar: this.computeTeamAvatarList(actorInfo.allPlayers),
          teamName: actorInfo.manager?.approvedName || actorInfo.player?.approvedName || "",
        };
      })
    );
  }

  private findPlayerAndTeammates(localPlayer: HubPlayer, players: HubPlayer[]) {
    const player = players.find(p => p.id === localPlayer.id)!;

    // currently, the player's representation in the hub is incorrect for some reason - taking 
    // the object we have instead for now
    return {
      player: localPlayer,
      teammates: players.filter(teammates => teammates.id !== localPlayer.id),
      allPlayers: players,
      manager: players.find(p => p.isManager)
    };
  }

  private computeTeamAvatarList(players: HubPlayer[]) {
    if (!players?.length)
      return [""];

    return players.map(p => p.sponsorLogo);
  }

  protected promoteToManager(localPlayer: Player, playerId: string) {
    this.hub.state$.pipe(first()).subscribe(s => {
      if (!s.id) {
        throw new Error("Can't promote a manager while the hub is disconnected.");
      }
      if (!localPlayer) {
        throw new Error("Can't resolve the current player to promote manager.");
      }

      this.playerApi.promoteToManager(s.id, playerId, { currentManagerPlayerId: localPlayer.id }).pipe(first()).subscribe(_ => {
        this.onManagerPromoted.emit(playerId);
      });
    });
  }
}
