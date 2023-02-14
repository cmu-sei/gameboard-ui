import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HubState, NotificationService } from '../../utility/notification.service';

export enum PlayerStatus {
  Offline,
  Online,
  Ready
}

@Component({
  selector: 'app-player-status',
  templateUrl: './player-status.component.html',
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit {
  @Input() userId!: string;

  constructor(private notificationService: NotificationService) { }

  protected statusIndicatorFill = "#ff0000";
  protected isActive = false;
  protected tooltipText = "Disconnected from the matchmaking hub";

  ngOnInit(): void {
    this.notificationService.state$.subscribe(state => {
      this.isActive = state.actors.some(a => a.id === this.userId);
      this.tooltipText = this.isActive ? "Connected to the game" : "Not connected to the game";
      this.statusIndicatorFill = this.isActive ? "#ff0000" : "#00ff00";
    });
  }
}
