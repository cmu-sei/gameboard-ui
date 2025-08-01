import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { ScoringService } from '@/services/scoring/scoring.service';
import { ScoreboardData, ScoreboardDataTeam } from '@/services/scoring/scoring.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ScoreboardTeamDetailModalComponent } from '../scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';

@Component({
    selector: 'app-scoreboard',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.scss'],
    standalone: false
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  @Input() gameId?: string;
  @Input() suppressLiveGameBanner = false;

  protected canViewAllScores = false;
  protected cumulativeTimeTooltip = "Cumulative Time is only used for tiebreaking purposes. When a challenge is started, a timer tracks how long it takes to solve that challenge. The sum time of all successfully solved challenges is the value in this column.";
  protected hasAdvancedPlayers = false;
  protected isLive = false;
  protected isLoading = true;
  protected isTeamGame = false;
  protected scoreboardData: ScoreboardData | null = null;
  protected advancingTeams: ScoreboardDataTeam[] = [];
  protected nonAdvancingTeams: ScoreboardDataTeam[] = [];

  private liveGameSub?: Subscription;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private route: ActivatedRoute,
    private scoreService: ScoringService) { }

  async ngOnInit() {
    if (!this.gameId) {
      this.gameId = this.route.snapshot.data.gameId;

      if (!this.gameId)
        throw new Error("Couldn't resolve the gameId.");
    }

    await this.loadGame(this.gameId);
  }

  ngOnDestroy(): void {
    this.liveGameSub?.unsubscribe();
  }

  protected handleRowClick(teamData: ScoreboardDataTeam) {
    if (!teamData.userCanAccessScoreDetail)
      return;

    this.modalConfirmService.openComponent<ScoreboardTeamDetailModalComponent>({
      content: ScoreboardTeamDetailModalComponent,
      context: { teamId: teamData.score.teamId },
      modalClasses: [
        teamData.players.length > 1 ? "modal-xl" : "modal-lg"
      ]
    });
  }

  private async loadGame(gameId: string) {
    this.isLoading = true;
    this.scoreboardData = await firstValueFrom(this.scoreService.getScoreboard(gameId));
    this.isLoading = false;

    // record if we have any qualifying players (affects rendering)
    this.hasAdvancedPlayers = !!this.scoreboardData.teams.filter(t => t.isAdvancedToNextRound).length;
    this.advancingTeams = this.scoreboardData.teams.filter(t => t.isAdvancedToNextRound);
    this.nonAdvancingTeams = this.scoreboardData.teams.filter(t => !t.isAdvancedToNextRound);

    this.isLive = false;
    this.isTeamGame = this.scoreboardData.game.isTeamGame;
    this.liveGameSub?.unsubscribe();

    if (this.scoreboardData.game.isLiveUntil) {
      this.isLive = true;
      this.liveGameSub = interval(60000).subscribe(_ => {
        this.loadGame(gameId);
      });
    }
  }
}
