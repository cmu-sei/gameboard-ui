import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of, Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { calculateCountdown, TimeWindow } from '../../../api/player-models';
import { fa } from '@/services/font-awesome.service';
import { HubState, NotificationService } from '../../../services/notification.service';

export interface GameboardPerformanceSummaryViewModel {
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
  styleUrls: ['./gameboard-performance-summary.component.scss']
})
export class GameboardPerformanceSummaryComponent implements OnInit, OnChanges {
  @Input() ctx?: GameboardPerformanceSummaryViewModel;
  @Output() onRefreshRequest = new EventEmitter<string>();

  countdown$?: Observable<number | undefined>;
  hubState$: BehaviorSubject<HubState>;
  protected fa = fa;

  constructor(
    hubService: NotificationService) {
    this.hubState$ = hubService.state$;
  }

  ngOnInit(): void {
    this.updateCountdown();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateCountdown();
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
