import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
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
export class GameboardPerformanceSummaryComponent implements OnInit, OnDestroy {
  @Input() boardPlayer!: BoardPlayer;
  @Output() onRefreshRequest = new EventEmitter<string>();

  clockSubscription?: Subscription;
  hubState$: BehaviorSubject<HubState>;

  constructor(
    hubService: NotificationService,
    public faService: FontAwesomeService,
    private playerService: PlayerService) {
    this.hubState$ = hubService.state$;
  }

  ngOnInit(): void {
    this.clockSubscription = interval(1000).subscribe(_ => {
      this.boardPlayer.session.countdown = calculateCountdown(this.boardPlayer.session);
    });
  }

  ngOnDestroy(): void {
    this.clockSubscription?.unsubscribe();
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
}
