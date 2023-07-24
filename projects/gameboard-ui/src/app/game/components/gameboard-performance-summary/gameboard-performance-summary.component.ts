import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
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
  @Input() ctx?: GameboardPerformanceSummaryViewModel;
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

  async extendSession(quit: boolean): Promise<void> {
    if (!this.ctx) {
      throw new Error("Can't extend the session without a Player.");
    }

    const updatedPlayer = await firstValueFrom(this.playerService.updateSession({
      teamId: this.ctx.player.teamId,
      sessionEnd: quit ? new Date(Date.parse("0001-01-01T00:00:00Z")) : new Date()
    }));

    this.onRefreshRequest.emit(this.ctx.player.id);
  }

  private updateCountdown() {
    this.countdown$ = combineLatest([
      timer(0, 1000),
      of(this.ctx)
    ]).pipe(
      map(([timer, ctx]) => ctx),
      map(ctx => calculateCountdown(ctx?.player.session))
    );
  }
}
