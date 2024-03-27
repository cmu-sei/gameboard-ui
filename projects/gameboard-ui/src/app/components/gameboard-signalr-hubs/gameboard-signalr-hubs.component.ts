import { Component, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { environment } from "../../../environments/environment";
import { UserService as LocalUserService } from '@/utility/user.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { LogService } from '@/services/log.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ApiUser } from '@/api/user-models';
import { StatusLightState } from '@/core/components/status-light/status-light.component';
import { SupportHubService } from '@/services/signalR/support-hub.service';
import { UserHubService } from '@/services/signalR/user-hub.service';
import { Observable } from 'rxjs';
import { GameHubActiveEnrollment } from '@/services/signalR/game-hub.models';

@Component({
  selector: 'app-gameboard-signalr-hubs',
  templateUrl: './gameboard-signalr-hubs.component.html',
  styleUrls: ['./gameboard-signalr-hubs.component.scss'],
  providers: [UnsubscriberService]
})
export class GameboardSignalRHubsComponent implements OnDestroy {
  protected isDevMode = false;
  protected supportHubStatusLightState: StatusLightState = "none";
  protected userHubStatusLightState: StatusLightState = "none";

  protected gameHubContext: {
    activeEnrollments$: Observable<GameHubActiveEnrollment[]>,
    hubState$: Observable<HubConnectionState>,
    status: StatusLightState,
  };
  protected userHubTooltip = "";

  constructor(
    private gameHub: GameHubService,
    private localUser: LocalUserService,
    private logService: LogService,
    private supportHub: SupportHubService,
    private unsub: UnsubscriberService,
    private userHub: UserHubService) {
    this.unsub.add(
      this.localUser.user$.subscribe(async u => await this.handleLocalUserChanged.bind(this)(u)),
    );

    this.isDevMode = !environment.production;
    this.gameHubContext = {
      activeEnrollments$: this.gameHub.activeEnrollments$,
      hubState$: this.gameHub.hubState$,
      status: "none"
    };
  }

  async ngOnDestroy(): Promise<void> {
    await this.gameHub.disconnect();
  }

  private async handleLocalUserChanged(u: ApiUser | null) {
    // hubs automatically manage repeated calls to connect/disconnect, so you won't
    // get duplicate connections if, for example, connect is called while it's already connected
    if (!u) {
      this.log("Local user is logged out, disconnecting from hubs");
      await this.gameHub.disconnect();
      await this.supportHub.disconnect();
      await this.userHub.disconnect();
    }
    else {
      this.log("Local user is logged in, connecting", u);

      // remove any existing handlers
      this.unsub.unsubscribeAll();

      // connect to the hubs
      await this.gameHub.connect();
      await this.supportHub.connect();
      await this.userHub.connect();

      // listen for interesting events to log
      this.unsub.add(
        this.gameHub.hubState$.subscribe(gameHubState => {
          this.log("State change to", gameHubState);
          this.gameHubContext.status = this.hubStateToStatusLightState(gameHubState);
        }),

        this.userHub.hubState$.subscribe(userHubState => {
          this.userHubStatusLightState = this.hubStateToStatusLightState(userHubState);
          this.userHubTooltip = `UserHub: ${userHubState}`;
        }),

        this.supportHub.hubState$.subscribe(supportHubState => this.supportHubStatusLightState = this.hubStateToStatusLightState(supportHubState))
      );
    }
  }

  private hubStateToStatusLightState(state: HubConnectionState): StatusLightState {
    switch (state) {
      case HubConnectionState.Connected:
        return "active";
      case HubConnectionState.Disconnected:
      case HubConnectionState.Disconnecting:
        return "error";
      default:
        return "preparing";
    }
  }

  private log(...args: any[]) {
    this.logService.logInfo("[GB GameHub]: ", ...args);
  }
}
