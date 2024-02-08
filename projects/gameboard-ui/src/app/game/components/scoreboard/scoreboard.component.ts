import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { ScoringService } from '@/services/scoring/scoring.service';
import { ScoreboardData, ScoreboardDataTeam } from '@/services/scoring/scoring.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ScoreboardTeamDetailModalComponent } from '../scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { NowService } from '@/services/now.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss'],
  providers: [UnsubscriberService]
})
export class ScoreboardComponent implements OnChanges {
  @Input() gameId?: string;

  protected cumulativeTimeTooltip = "Cumulative Time is only used for tiebreaking purposes. When a challenge is started, a timer tracks how long it takes to solve that challenge. The sum time of all successfully solved challenges is the value in this column.";
  protected hasAnyPlayingOrAdvanced = false;
  protected liveGameSub?: Subscription;
  protected isLoading = true;
  protected scoreboardData: ScoreboardData | null = null;

  private gameEnd?: DateTime;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private nowService: NowService,
    private scoreService: ScoringService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.gameId && this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  protected handleRowClick(teamData: ScoreboardDataTeam) {
    this.modalConfirmService.openComponent<ScoreboardTeamDetailModalComponent>({
      content: ScoreboardTeamDetailModalComponent,
      context: { teamId: teamData.score.teamId },
      modalClasses: [
        teamData.players.length > 1 ? "modal-xl" : "modal-lg",
        "modal-dialog-centered"
      ]
    });
  }

  private async loadGame(gameId: string) {
    this.isLoading = true;
    this.scoreboardData = await firstValueFrom(this.scoreService.getScoreboard(gameId));
    this.isLoading = false;

    this.liveGameSub?.unsubscribe();
    if (this.scoreboardData.game.isLiveUntil)
      this.liveGameSub = interval(60000).subscribe(_ => {
        this.loadGame(gameId);
      });
  }
}
