import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HubPlayer } from '../../../api/player-models';
import { NotificationService } from '../../../services/notification.service';

export enum PlayerStatus {
  Offline,
  Online,
  Ready
}

@Component({
  selector: 'app-player-status',
  template: `
    <div class="game-hub-status-component d-flex justify-content-center align-items-center" [tooltip]="tooltipText || ''">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px">
        <circle [class]="hasActiveSession ? 'started' : 'not-started'" [attr.cx]="15" [attr.cy]="15" [attr.r]="8" [attr.fill]="statusIndicatorFill" />
      </svg>
    </div>
  `,
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit {
  @Input() playerId: string | undefined = undefined;

  private static DEFAULT_FILL = "#888888";
  private static DEFAULT_TOOLTIP = "Determining player session status...";

  protected hasActiveSession = false;
  protected statusIndicatorFill = PlayerStatusComponent.DEFAULT_FILL;
  protected tooltipText = PlayerStatusComponent.DEFAULT_TOOLTIP;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.actors$.pipe(
      tap((actors: HubPlayer[]) => this.update(actors))
    );
    this.update(this.notificationService.actors$.getValue());
  }

  private resolveStatusIndicatorFill(hasSession?: boolean): string {
    if (hasSession === undefined) {
      return PlayerStatusComponent.DEFAULT_FILL;
    }

    return hasSession ? "#00ff00" : "#333333";
  }

  private resolveStatusIndicatorTooltip(hasSession?: boolean): string {
    if (hasSession === undefined) {
      return PlayerStatusComponent.DEFAULT_TOOLTIP;
    }

    return hasSession ? "Is currently playing" : "Is not currently playing";
  }

  private resolveHasActiveSesssion(p: HubPlayer) {
    return !!p.session?.isDuring;
  }

  private update(actors: HubPlayer[]) {
    const player = actors.find(a => a.id === this.playerId);
    if (!player) {
      throw new Error("Couldn't resolve player for player status component");
    }

    this.hasActiveSession = this.resolveHasActiveSesssion(player);
    this.statusIndicatorFill = this.resolveStatusIndicatorFill(player.session?.isDuring);
    this.tooltipText = this.resolveStatusIndicatorTooltip(player.session?.isDuring);
  }
}
