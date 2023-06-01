import { Game } from '@/api/game-models';
import { GameScoringConfig } from '@/services/scoring/scoring.models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-game-bonuses',
  templateUrl: './game-bonuses.component.html',
  styleUrls: ['./game-bonuses.component.scss']
})
export class GameBonusesComponent implements OnChanges {
  @Input() game?: Game;

  scoringConfig$: Observable<GameScoringConfig | null> = of(null);
  isLoading = false;

  constructor(private scoringService: ScoringService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.game?.currentValue?.id !== changes.game?.previousValue?.id) {
      this.isLoading = true;
      this.scoringConfig$ = this
        .scoringService
        .getGameScoringConfig(changes.game.currentValue.id)
        .pipe(tap(config => {
          // if this game has bonuses configured, announce this so that interested
          // components can respond
          this.isLoading = false;
        }));
    }
  }
}
