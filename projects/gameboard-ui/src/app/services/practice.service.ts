import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PracticeService {
  constructor(private gameService: GameService) { }

  isEnabled(): Promise<boolean> {
    return firstValueFrom(this.gameService.list({}).pipe(map(games => games.some(g => g.playerMode == PlayerMode.practice))));
  }
}
