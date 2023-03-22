import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { BoardPlayer } from '../../../api/board-models';
import { calculateCountdown, SessionChangeRequest } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { FontAwesomeService } from '../../../services/font-awesome.service';
import { HubState, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gameboard-performance-summary',
  templateUrl: './gameboard-performance-summary.component.html',
  styleUrls: ['./gameboard-performance-summary.component.scss']
})
export class GameboardPerformanceSummaryComponent implements OnInit, OnChanges {
  @Input() boardPlayer!: BoardPlayer;
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
    const model: SessionChangeRequest = {
      teamId: this.boardPlayer.teamId,
      sessionEnd: quit ? new Date(Date.parse("0001-01-01T00:00:00Z")) : new Date()
    }
    this.playerService.updateSession(model).pipe(
      first()
    ).subscribe(_ =>
      this.onRefreshRequest.emit(this.boardPlayer.id)
    );
  }

  private updateCountdown() {
    this.countdown$ = timer(0, 1000).pipe(
      map(_ => calculateCountdown(this.boardPlayer.session))
    );
  }
}
