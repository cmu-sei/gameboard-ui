import { Component } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { SupportHubService } from '@/services/signalR/support-hub.service';

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html'
})
export class AdminOverviewComponent {
  protected gameHubState$: Observable<HubConnectionState>;
  protected supportHubState$: Observable<HubConnectionState>;

  constructor(
    gameHubService: GameHubService,
    supportHub: SupportHubService) {
    this.gameHubState$ = gameHubService.hubState$;
    this.supportHubState$ = supportHub.hubState$;
  }
}
