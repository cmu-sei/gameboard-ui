import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { calculateCountdown, TimeWindow } from '../../../api/player-models';
import { fa } from '@/services/font-awesome.service';
import { HubState, NotificationService } from '../../../services/notification.service';
import { ChallengesService } from '@/api/challenges.service';
import { BoardService } from '@/api/board.service';

interface GameboardPerformanceSummaryViewModel {
  player: {
    id: string;
    teamId: string;
    session?: TimeWindow;
    scoring: {
      rank?: number;
      score: number;
      correctCount: number;
      partialCount: number;
    }
  }
}

@Component({
  selector: 'app-gameboard-performance-summary',
  templateUrl: './gameboard-performance-summary.component.html',
  styleUrls: ['./gameboard-performance-summary.component.scss'],
  standalone: false
})
export class GameboardPerformanceSummaryComponent implements OnInit, OnChanges {
  @Input() playerId?: string;

  countdown$?: Observable<number | undefined>;
  protected ctx?: GameboardPerformanceSummaryViewModel;
  isCountdownOver = false;
  hubState$: BehaviorSubject<HubState>;
  protected fa = fa;

  constructor(
    challengesService: ChallengesService,
    hubService: NotificationService,
    private boardService: BoardService) {
    challengesService.challengeGraded$.subscribe(async c => {
      if (this.ctx && c.teamId === this.ctx.player.teamId) {
        await this.load();
      }
    });
    this.hubState$ = hubService.state$;
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.load();
  }

  private async load() {
    if (!this.playerId)
      return;

    const boardInfo = await firstValueFrom(this.boardService.load(this.playerId));
    this.ctx = {
      player: {
        id: this.playerId,
        session: boardInfo.session,
        teamId: boardInfo.teamId,
        scoring: {
          partialCount: boardInfo.partialCount,
          correctCount: boardInfo.correctCount,
          rank: boardInfo.rank,
          score: boardInfo.score,

        }
      }
    };

    // update the countdown
    this.countdown$ = combineLatest([
      timer(0, 1000),
      of(this.ctx)
    ]).pipe(
      map(([timer, ctx]) => ctx),
      map(ctx => calculateCountdown(ctx?.player.session)),
      tap(countdownRemaining => {
        this.isCountdownOver = (countdownRemaining || 0) <= 0;
      })
    );
  }
}
