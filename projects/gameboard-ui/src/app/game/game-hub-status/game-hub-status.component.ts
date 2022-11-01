import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ConfigService } from '../../utility/config.service';
import { HubState, NotificationService } from '../../utility/notification.service';

export enum GameHubStatus {
  Disconnected,
  Connecting,
  Connected
}

@Component({
  selector: 'app-game-hub-status',
  templateUrl: './game-hub-status.component.html',
  styleUrls: ['./game-hub-status.component.scss']
})
export class GameHubStatusComponent {
  @Input() gameHubStatus = GameHubStatus.Disconnected;
  public baseHref: string;
  public imagePath = "assets/red-light.png";
  public tooltip = "Disconnected from the matchmaking hub";

  constructor (config: ConfigService, notificationService: NotificationService) {
    this.baseHref = config.absoluteUrl;

    notificationService.state$.subscribe(state => {
      this.gameHubStatus = state.connected ? GameHubStatus.Connected : GameHubStatus.Disconnected;

      switch (this.gameHubStatus) {
        case GameHubStatus.Connected:
          this.imagePath = "assets/green-light.png";
          this.tooltip = "Connected to the matchmaking hub";
          break;
        // case GameHubStatus.Connecting:
        //   this.imagePath = "assets/yellow-light.png";
        //   break;
        default:
          this.imagePath = "assets/red-light.png";
          this.tooltip = "Disconnected from the matchmaking hub";
          break;
      }
    });
  }
}
