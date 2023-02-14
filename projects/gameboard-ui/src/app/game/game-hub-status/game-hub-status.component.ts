import { Component, Input } from '@angular/core';
import { ConfigService } from '../../utility/config.service';
import { NotificationService } from '../../utility/notification.service';

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

  protected statusIndicatorFill = "#ff0000";
  protected isActive = false;
  protected tooltipText = "Disconnected from the matchmaking hub";

  constructor(config: ConfigService, notificationService: NotificationService) {
    this.baseHref = config.absoluteUrl;

    notificationService.state$.subscribe(state => {
      this.isActive = state.connected;
      this.tooltip = state.connected ? "Connected to the game" : "Not connected to the game";
      this.statusIndicatorFill = state.connected ? "#ff0000" : "#00ff00";
      // this.gameHubStatus = state.connected ? GameHubStatus.Connected : GameHubStatus.Disconnected;

      // switch (this.gameHubStatus) {
      //   case GameHubStatus.Connected:
      //     this.imagePath = "assets/green-light.png";
      //     this.tooltip = "Connected to the matchmaking hub";
      //     break;
      //   default:
      //     this.imagePath = "assets/red-light.png";
      //     this.tooltip = "Disconnected from the matchmaking hub";
      //     break;
      // }
    });
  }
}
