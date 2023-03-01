import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export enum PlayerStatus {
  Offline,
  Online,
  Ready
}

@Component({
  selector: 'app-player-status',
  template: `
    <div class="game-hub-status-component d-flex justify-content-center align-items-center" [tooltip]="(tooltipText$ | async) || ''">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16px" height="16px">
          <circle [attr.cx]="8" [attr.cy]="8" [attr.r]="8" [attr.fill]="statusIndicatorFill$ | async" />
      </svg>
    </div>
  `,
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit {
  @Input() hasActiveSession$: Observable<boolean | undefined> = of(undefined);

  private static DEFAULT_FILL = "#888888";
  private static DEFAULT_TOOLTIP = "Determining player session status...";

  protected statusIndicatorFill$: Observable<string> = of(PlayerStatusComponent.DEFAULT_FILL);
  protected tooltipText$: Observable<string> = of(PlayerStatusComponent.DEFAULT_TOOLTIP);

  ngOnInit() {
    this.statusIndicatorFill$ = this.hasActiveSession$.pipe(map(sess => this.resolveStatusIndicatorFill(sess)));
    this.tooltipText$ = this.hasActiveSession$.pipe(map(sess => this.resolveStatusIndicatorTooltip(sess)));
  }

  private resolveStatusIndicatorFill(hasSession?: boolean): string {
    if (hasSession === undefined) {
      return PlayerStatusComponent.DEFAULT_FILL;
    }

    return hasSession ? "#00ff00" : "ff0000";
  }

  private resolveStatusIndicatorTooltip(hasSession?: boolean): string {
    if (hasSession === undefined) {
      return PlayerStatusComponent.DEFAULT_TOOLTIP;
    }

    return hasSession ? "Is currently playing" : "Is not currently playing";
  }
}
