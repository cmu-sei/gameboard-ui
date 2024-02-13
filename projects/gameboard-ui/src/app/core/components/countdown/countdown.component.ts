import { NowService } from '@/services/now.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, map, of, timer } from 'rxjs';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnChanges {
  // note that this should be in MS since epoch (e.g. new Date().valueOf())
  @Input() countdownTo?: number;

  protected timeRemaining$: Observable<number> = of(0);

  constructor(private nowService: NowService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.countdownTo) {
      this.timeRemaining$ = timer(0, 1000).pipe(
        map(() => {
          if (!this.countdownTo)
            return 0;

          return Math.max(this.countdownTo - this.nowService.now().valueOf(), 0);
        })
      );
    }
  }
}
