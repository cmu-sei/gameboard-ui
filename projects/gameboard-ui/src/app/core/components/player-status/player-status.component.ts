import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TimeWindow } from '../../../api/player-models';
import { ShortDatePipe } from '../../../utility/pipes/short-date.pipe';
import { ShortTimePipe } from '../../../utility/pipes/short-time.pipe';

export enum PlayerStatus {
  Offline,
  Online,
  Ready
}

@Component({
  selector: 'app-player-status',
  template: `
    <div class="game-hub-status-component d-flex justify-content-center align-items-center" [tooltip]="tooltipText || ''">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36px" height="36px">
        <circle
          [class.session-indeterminate]="!session" 
          [class.session-available]="session?.isBefore" 
          [class.session-active]="session?.isDuring" 
          [class.session-over]="session?.isAfter"
          [attr.cx]="18" [attr.cy]="18" [attr.r]="11" />
      </svg>
    </div>
  `,
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnChanges {
  @Input() session?: TimeWindow;

  private static DEFAULT_TOOLTIP = "Determining player session status...";

  protected tooltipText = PlayerStatusComponent.DEFAULT_TOOLTIP;

  ngOnChanges(changes: SimpleChanges): void {
    this.update(this.session);
  }

  private resolveStatusIndicatorTooltip(session?: TimeWindow): string {
    if (session === undefined) {
      return PlayerStatusComponent.DEFAULT_TOOLTIP;
    }

    if (this.session?.isBefore) {
      return "Registered to play (session not started)";
    }
    else if (this.session?.isAfter) {
      return "Session ended"
    }
    else {
      return "Playing now";
    }
  }

  private update(session?: TimeWindow) {
    this.tooltipText = this.resolveStatusIndicatorTooltip(session);
  }
}
