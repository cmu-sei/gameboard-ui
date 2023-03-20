import { Injectable } from '@angular/core';
import { Player, TimeWindow } from '../api/player-models';

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  canUnenroll(player: Player) {
    return this.canUnenrollSession(player.session);
  }

  canUnenrollSession(session?: TimeWindow) {
    return !session ? true : session.isBefore;
  }
}
