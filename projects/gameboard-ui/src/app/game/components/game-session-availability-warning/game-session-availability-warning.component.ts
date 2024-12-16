import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '@/api/game.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { interval, startWith } from 'rxjs';
import { GameSessionAvailibilityResponse } from '@/api/game-models';
import { CoreModule } from '@/core/core.module';

@Component({
  selector: 'app-game-session-availability-warning',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
  ],
  providers: [UnsubscriberService],
  templateUrl: './game-session-availability-warning.component.html',
  styleUrls: ['./game-session-availability-warning.component.scss']
})
export class GameSessionAvailabilityWarningComponent implements OnInit, OnDestroy {
  @Input() game?: { id: string; sessionAvailabilityWarningThreshold?: number };

  private _gameService = inject(GameService);
  private _unsub = inject(UnsubscriberService);

  protected availability?: GameSessionAvailibilityResponse;

  ngOnInit(): void {
    this._unsub.add(
      interval(300000).pipe(startWith(0)).subscribe(async () => {
        if (this.game?.id) {
          this.availability = await this._gameService.getSessionAvailability(this.game.id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this._unsub.unsubscribeAll();
  }
}
