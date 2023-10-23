import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScoringService } from '@/services/scoring/scoring.service';
import { GameScore, GameScoreGameInfo, GameScoreTeam, TeamGameScore } from '@/services/scoring/scoring.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ScoreboardTeamDetailModalComponent, ScoreboardTeamDetailModalContext } from '../scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnChanges {
  @Input() gameId?: string;

  protected gameData: GameScore | null = null;
  protected maxTeamMembers = 1;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private scoreService: ScoringService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.gameId && this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  protected handleRowClick(gameInfo: GameScoreGameInfo, teamScore: GameScoreTeam) {
    this.modalConfirmService.openComponent<ScoreboardTeamDetailModalComponent, ScoreboardTeamDetailModalContext>({
      content: ScoreboardTeamDetailModalComponent,
      context: {
        game: { id: gameInfo.id, name: gameInfo.name },
        teamData: teamScore
      },
      modalClasses: [
        teamScore.players.length > 1 ? "modal-xl" : "modal-lg",
        "modal-dialog-centered"
      ]
    });
  }

  private async loadGame(gameId: string) {
    this.gameData = await firstValueFrom(this.scoreService.getGameScore(gameId));

    this.maxTeamMembers = 1;
    for (const team of this.gameData.teams.filter(t => t.players.length > 1)) {
      if (team.players.length > this.maxTeamMembers) {
        this.maxTeamMembers = team.players.length;
      }
    }
  }
}
