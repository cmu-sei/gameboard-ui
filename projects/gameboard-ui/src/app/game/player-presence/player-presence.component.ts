// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { HubPlayer, Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { NotificationService } from '../../services/notification.service';
import { GameHubService } from '../../services/signalR/game-hub.service';
import { SyncStartState } from '../game.models';
import { SyncStartService } from '../../services/sync-start.service';
import { SimpleEntity } from '../../api/models';

interface PlayerPresenceContext {
  hasTeammates: boolean;
  manager: HubPlayer | undefined;
  allPlayers: HubPlayer[];
  player: HubPlayer;
  playerIsManager: boolean;
  readyPlayers: SimpleEntity[];
  notReadyPlayers: SimpleEntity[];
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
  @Input() isSyncStartGame: boolean = false;
  @Output() onManagerPromoted = new EventEmitter<string>();

  private syncStartState$ = new BehaviorSubject<SyncStartState | null>(null);
  private syncStartStateSubscription?: Subscription;

  protected promoteIcon = faChevronCircleUp;
  protected ctx$?: Observable<PlayerPresenceContext | null>;
  protected avatarUris: string[] = [];

  constructor(
    private gameHub: GameHubService,
    private hub: NotificationService,
    private playerApi: PlayerService,
    private syncStartService: SyncStartService,
  ) { }

  ngOnInit(): void {
    this.ctx$ = combineLatest([
      this.hub.actors$,
      this.player$,
      this.gameHub.syncStartChanged$
    ]).pipe(
      map(combo => combo as unknown as { 0: HubPlayer[], 1: HubPlayer, 2: SyncStartState }),
      map(combo => ({ actors: combo[0], player: combo[1], syncStartState: combo[2] })),
      map(context => {
        if (!context.player) {
          return null;
        }

        const actorInfo = this.findPlayerAndTeammates(context.player, context.actors);
        this.avatarUris = actorInfo.allPlayers.map(p => p.sponsorLogo);

        // grab team members on this screen and show their ready/not ready flag 
        // (read it into the player objects coming from the hub - should think about streamlining this later)
        const playerReadyStates = this.syncStartService.getAllPlayers(context.syncStartState);
        for (let player of actorInfo.allPlayers) {
          const playerReadyState = playerReadyStates.find(p => p.id === player.id);

          if (playerReadyState) {
            player.isReady = playerReadyState.isReady;
          }
        }

        return {
          hasTeammates: !!actorInfo.teammates.length,
          manager: actorInfo.manager,
          allPlayers: actorInfo.allPlayers,
          player: actorInfo.player,
          playerIsManager: !!actorInfo.manager && actorInfo.manager.id === actorInfo.player?.id,
          readyPlayers: this.syncStartService.getAllPlayers(context.syncStartState),
          notReadyPlayers: this.syncStartService.getNotReadyPlayers(context.syncStartState),
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
