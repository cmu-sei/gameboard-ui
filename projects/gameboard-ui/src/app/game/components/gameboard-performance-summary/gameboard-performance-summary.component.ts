import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { BoardPlayer } from '../../../api/board-models';
import { calculateCountdown, SessionChangeRequest } from '../../../api/player-models';
import { PlayerService } from '../../../api/player.service';
import { HubState, NotificationService } from '../../../services/notification.service';
import { FontAwesomeService } from '../../../utility/services/font-awesome.service';

@Component({
  selector: 'app-gameboard-performance-summary',
  templateUrl: './gameboard-performance-summary.component.html',
  styleUrls: ['./gameboard-performance-summary.component.scss']
})
export class GameboardPerformanceSummaryComponent implements OnInit, OnDestroy {
  @Input() boardPlayer!: BoardPlayer;

  clockSubscription?: Subscription;
  hubState$: BehaviorSubject<HubState>;

  constructor(
    public faService: FontAwesomeService,
    private hubService: NotificationService,
    private playerService: PlayerService) {
    this.hubState$ = hubService.state$;
  }

  ngOnInit(): void {
    this.clockSubscription = interval(1000).subscribe(_ => {
      console.log("tick", this.boardPlayer.session);
      this.boardPlayer.session.countdown = calculateCountdown(this.boardPlayer.session);
    });
  }

  ngOnDestroy(): void {
    this.clockSubscription?.unsubscribe();
  }

  extendSession(quit: boolean): void {
    const model: SessionChangeRequest = {
      teamId: this.boardPlayer.teamId,
      sessionEnd: quit ? "0001-01-01" : new Date().toISOString()
    }
    this.playerService.updateSession(model).pipe(first()).subscribe();
  }
}
