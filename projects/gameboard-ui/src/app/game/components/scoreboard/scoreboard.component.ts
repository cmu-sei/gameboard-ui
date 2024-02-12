import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subscription, firstValueFrom, interval, map } from 'rxjs';
import { ScoringService } from '@/services/scoring/scoring.service';
import { ScoreboardData, ScoreboardDataTeam } from '@/services/scoring/scoring.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ScoreboardTeamDetailModalComponent } from '../scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { UnsubscriberService } from '@/services/unsubscriber.service';

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
  protected isLoading = true;
  protected isLive = false;
  protected scoreboardData: ScoreboardData | null = null;
  protected myString$?: Observable<string | null>;

  private liveGameSub?: Subscription;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private scoreService: ScoringService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.gameId && this.gameId) {
      this.loadGame(this.gameId);
    }
  }

  protected handleRowClick(teamData: ScoreboardDataTeam) {
    // we don't show the details while the competition is ongoing
    if (this.isLive) return;

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

    this.isLive = false;
    this.liveGameSub?.unsubscribe();

    for (let team of this.scoreboardData.teams.filter(t => !!t.sessionEnds)) {
      this.myString$ = interval(1000).pipe(
        map(_ => {
          const diffed = team.sessionEnds!.diffNow().rescale();
          diffed.normalize();

          return diffed
            .set({ milliseconds: 0 })
            .set({ seconds: Math.floor(diffed.get("seconds")) })
            .rescale();
        }),
        map(duration => {
          if (duration.as("milliseconds") < 0)
            return null;

          return duration.toHuman();
        })
      );
    }

    if (this.scoreboardData.game.isLiveUntil) {
      this.isLive = true;

      this.liveGameSub = interval(60000).subscribe(_ => {
        this.loadGame(gameId);
      });
    }
  }
}
