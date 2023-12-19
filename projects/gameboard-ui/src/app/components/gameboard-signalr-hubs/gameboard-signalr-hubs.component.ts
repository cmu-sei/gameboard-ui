import { Component, OnDestroy } from '@angular/core';
import { HubConnectionState } from '@microsoft/signalr';
import { environment } from "../../../environments/environment";
import { UserService as LocalUserService } from '@/utility/user.service';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { LogService } from '@/services/log.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ApiUser } from '@/api/user-models';
import { StatusLightState } from '@/core/components/status-light/status-light.component';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-gameboard-signalr-hubs',
  templateUrl: './gameboard-signalr-hubs.component.html',
  styleUrls: ['./gameboard-signalr-hubs.component.scss'],
  providers: [UnsubscriberService]
})
export class GameboardSignalRHubsComponent implements OnDestroy {
  protected isDevMode = false;
  protected statusLightState: StatusLightState = "none";
  protected tooltip = "";

  constructor(
    private gameHub: GameHubService,
    private localUser: LocalUserService,
    private logService: LogService,
    private unsub: UnsubscriberService) {
    this.unsub.add(
      this.localUser.user$.subscribe(u => this.handleLocalUserChanged.bind(this)(u))
    );

    this.isDevMode = !environment.production;
  }

  async ngOnDestroy(): Promise<void> {
    await this.gameHub.disconnect();
  }

  private handleLocalUserChanged(u: ApiUser | null) {
    this.log("Local user changed", u);
    // gamehub automatically manages repeated calls to connect/disconnect, so you won't
    // get duplicate connections if, for example, connect is called while it's already connected
    if (!u) {
      this.log("Local user is logged out, disconnecting from hubs");
      this.gameHub.disconnect();
    }
    else {
      this.log("Local user is logged in, connecting", u);

      // remove any existing handlers
      this.unsub.unsubscribeAll();

      // connect to the hub
      this.gameHub.connect();

      // listen for interesting events to log
      this.unsub.add(
        this.gameHub.hubState$.subscribe(gameHubState => {
          this.log("[GB GameHub]: Hub state is", gameHubState);
        }),

        combineLatest([this.gameHub.hubState$, this.gameHub.joinedGameIds$]).pipe(
          map(([hubState, joinedGameIds]) => ({ hubState, joinedGameIds }))
        ).subscribe(ctx => {
          this.log("Game hub state change:", ctx);
          this.statusLightState = this.hubStateToStatusLightState(ctx.hubState);
          this.tooltip = this.buildTooltip(ctx);
        })
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

  private buildTooltip(gameHubContext: { hubState: HubConnectionState, joinedGameIds: string[] }): string {
    let tooltip = `GameHub: ${gameHubContext.hubState}`;

    if (gameHubContext.joinedGameIds.length) {
      tooltip += "\nGames:\n";

      for (const gameId of gameHubContext.joinedGameIds) {
        tooltip += `\t- ${gameId}`;
      }
    }

    return tooltip;
  }

  private log(...args: any[]) {
    this.logService.logInfo("[GB GameHub]: ", ...args);
  }
}
