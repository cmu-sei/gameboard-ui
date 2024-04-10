import { GameHubService } from '@/services/signalR/game-hub.service';
import { SupportHubService } from '@/services/signalR/support-hub.service';
import { Component } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss']
})
export class AdminOverviewComponent {
  protected gameHubState$: Observable<HubConnectionState>;
  protected supportHubState$: Observable<HubConnectionState>;

  constructor(
    private gameHubService: GameHubService,
    supportHub: SupportHubService) {
    this.gameHubState$ = gameHubService.hubState$;
    this.supportHubState$ = supportHub.hubState$;
  }
}
