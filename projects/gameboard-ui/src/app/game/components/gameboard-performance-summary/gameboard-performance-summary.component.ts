import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
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
  @Input() ctx$!: Observable<GameboardPerformanceSummaryViewModel | undefined>;
  @Output() onRefreshRequest = new EventEmitter<string>();

  countdown$?: Observable<number | undefined>;
  hubState$: BehaviorSubject<HubState>;
  private ctx?: GameboardPerformanceSummaryViewModel;

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
    const player = this.ctx?.player;

    if (!player) {
      throw new Error("Can't extend the session without a Player.");
    }

    const model: SessionChangeRequest = {
      teamId: player.teamId,
      sessionEnd: quit ? new Date(Date.parse("0001-01-01T00:00:00Z")) : new Date()
    }
    this.playerService.updateSession(model).pipe(
      first()
    ).subscribe(_ =>
      this.onRefreshRequest.emit(player.id)
    );
  }

  private updateCountdown() {
    this.countdown$ = timer(0, 1000).pipe(
      map(_ => calculateCountdown(this.ctx?.player.session))
    );
  }
}
