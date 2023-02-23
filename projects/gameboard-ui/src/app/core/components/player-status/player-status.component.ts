import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HubState, NotificationService } from '../../../services/notification.service';

export enum PlayerStatus {
  Offline,
  Online,
  Ready
}

@Component({
  selector: 'app-player-status',
  template: `
    <div class="game-hub-status-component d-flex justify-content-center align-items-center" *ngIf="hubState$ | async as hubState">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16px" height="16px">
          <circle [attr.cx]="8" [attr.cy]="8" [attr.r]="8" [attr.fill]="statusIndicatorFill" />
      </svg>
    </div>
  `,
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit {
  // @Input() userId!: string;
  @Input() isOnline?: boolean = undefined;

  constructor(private notificationService: NotificationService) { }

  protected hubState$ = this.notificationService.state$;
  protected statusIndicatorFill = "#ff0000";
  protected tooltipText = "Disconnected from the matchmaking hub";

  ngOnInit(): void {
    // this.notificationService.state$.subscribe(state => {
    //   this.isActive = state.actors.some(a => a.id === this.userId);
    //   this.tooltipText = this.isActive ? "Connected to the game" : "Not connected to the game";
    //   this.statusIndicatorFill = this.isActive ? "#00ff00" : "#ff0000";
    // });
    this.statusIndicatorFill = this.resolveStatusIndicatorFill(this.isOnline);
  }

  private resolveStatusIndicatorFill(isOnline?: boolean): string {
    if (this.isOnline === undefined) {
      return "#888888";
    }

    return this.isOnline ? "#00ff00" : "ff0000";
  }
}
