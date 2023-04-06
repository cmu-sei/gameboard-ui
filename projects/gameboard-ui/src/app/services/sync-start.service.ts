import { Injectable } from '@angular/core';
import { SimpleEntity } from '../api/models';
import { SyncStartPlayer, SyncStartState } from '../game/game.models';

@Injectable({ providedIn: 'root' })
export class SyncStartService {
  public getReadyPlayers(state: SyncStartState): SimpleEntity[] {
    return this.getPlayersWithReadyState(state, true);
  }

  public getNotReadyPlayers(state: SyncStartState): SimpleEntity[] {
    return this.getPlayersWithReadyState(state, false);
  }

  public getAllPlayers(state: SyncStartState): SyncStartPlayer[] {
    var teamArrays = state.teams.map(t => t.players);

    if (!teamArrays.length) {
      return [];
    }

    return teamArrays.reduce((players1, players2) => players1.concat(players2));
  }

  private getPlayersWithReadyState(state: SyncStartState, readyState: boolean): SimpleEntity[] {
    if (!state || !state.teams.length) {
      return [];
    }

    return this.getAllPlayers(state).filter(p => p.isReady == readyState) || [];
  }
}
