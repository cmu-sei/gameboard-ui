import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameScore } from '@/api/scoring-models';
import { ScoringService } from '@/services/scoring/scoring.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnChanges {
  @Input() gameId?: string;

  protected isTeamGame = false;
  protected gameData: GameScore | null = null;

  constructor(private scoreService: ScoringService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.gameId && this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  private async loadGame(gameId: string) {
    this.gameData = await firstValueFrom(this.scoreService.getGameScore(gameId));
  }
}
