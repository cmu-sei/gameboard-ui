import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScoringService } from '@/services/scoring/scoring.service';
import { GameScore, GameScoreGameInfo, GameScoreTeam } from '@/services/scoring/scoring.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ScoreboardTeamDetailModalComponent } from '../scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnChanges {
  @Input() gameId?: string;

  protected gameData: GameScore | null = null;
  protected maxTeamMembers = 1;
  protected cumulativeTimeTooltip = "Cumulative Time is only used for tiebreaking purposes. When a challenge is started, a timer tracks how long it takes to solve that challenge. The sum time of all successfully solved challenges is the value in this column.";
  protected funnyTooltip = `<p>This is ok</p><p>isn't it?</p>`;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private scoreService: ScoringService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.gameId && this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  protected handleRowClick(gameInfo: GameScoreGameInfo, teamScore: GameScoreTeam) {
    this.modalConfirmService.openComponent<ScoreboardTeamDetailModalComponent>({
      content: ScoreboardTeamDetailModalComponent,
      context: { teamId: teamScore.team.id },
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
