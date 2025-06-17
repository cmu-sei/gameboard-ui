import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimeWindow } from '@/api/player-models';
import { GameSessionService } from '@/services/game-session.service';

@Component({
    selector: 'app-cumulative-time-clock',
    templateUrl: './cumulative-time-clock.component.html',
    standalone: false
})
export class CumulativeTimeClockComponent implements OnInit, OnChanges {
  @Input() session?: TimeWindow;

  time$?: Observable<number>;

  constructor(private gameSessionService: GameSessionService) { }

  ngOnInit(): void {
    this.startClock(this.session);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.startClock(this.session);
  }

  private startClock(session?: TimeWindow) {
    if (session) {
      this.time$ = timer(0, 1000)
        .pipe(map(_ => this.gameSessionService.getCumulativeTime(this.session!)));
    }
    else {
      this.time$ = undefined;
    }
  }
}
