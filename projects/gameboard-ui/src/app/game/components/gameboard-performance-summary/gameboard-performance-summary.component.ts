import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject, timer } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { calculateCountdown, Player, SessionChangeRequest, TimeWindow } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { FontAwesomeService } from '../../../services/font-awesome.service';
import { HubState, NotificationService } from '../../../services/notification.service';

export interface GameboardPerformanceSummaryViewModel {
  player: {
    id: string;
    teamId: string;
    session?: TimeWindow;
    scoring: {
      rank: number;
      score: number;
      correctCount: number;
      partialCount: number;
    }
  },
  game: {
    isPracticeMode: boolean
  }
}

@Component({
  selector: 'app-gameboard-performance-summary',
  templateUrl: './gameboard-performance-summary.component.html',
  styleUrls: ['./gameboard-performance-summary.component.scss']
})
export class GameboardPerformanceSummaryComponent implements OnInit, OnChanges {
  @Input() ctx$!: Subject<GameboardPerformanceSummaryViewModel | undefined>;
  @Output() onRefreshRequest = new EventEmitter<string>();

  countdown$?: Observable<number | undefined>;
  hubState$: BehaviorSubject<HubState>;

  constructor(
    hubService: NotificationService,
    public faService: FontAwesomeService,
    private playerService: PlayerService) {
    this.hubState$ = hubService.state$;
  }

  ngOnInit(): void {
    this.updateCountdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateCountdown();
  }

  extendSession(quit: boolean): void {
    const player = this.ctx$.pipe(
      map(ctx => {
        if (!ctx?.player) {
          throw new Error("Can't extend the session without a Player.");
        }

        return {
          teamId: ctx.player.teamId,
          sessionEnd: quit ? new Date(Date.parse("0001-01-01T00:00:00Z")) : new Date()
        } as SessionChangeRequest;
      }),
      switchMap(request => {
        return this.playerService.updateSession(request).pipe(
          first()
        );
      }),
      first(),
      tap(player => {
        this.onRefreshRequest.emit(player.id);
      })
    ).subscribe();
  }

  private updateCountdown() {
    this.countdown$ = combineLatest([
      timer(0, 1000),
      this.ctx$
    ]).pipe(
      map(combo => combo[1]),
      map(ctx => calculateCountdown(ctx?.player.session))
    );
  }
}
