import { AfterViewInit, Component, HostListener, inject, model, signal, Signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from "@angular/core/rxjs-interop";
import { ConsoleComponent, ConsoleComponentConfig, ConsoleConnectionStatus } from "@cmusei/console-forge";
import { interval, map } from 'rxjs';
import { UserActivityListenerComponent } from '../user-activity-listener/user-activity-listener.component';
import { ConsolesService } from '@/api/consoles.service';
import { ConsoleId, ConsoleUserActivityType } from '@/api/consoles.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { AppTitleService } from '@/services/app-title.service';
import { ToastService } from '@/utility/services/toast.service';
import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { CountdownPipe } from '@/core/pipes/countdown.pipe';
import { NowService } from '@/services/now.service';

@Component({
  selector: 'app-console-page',
  imports: [
    ConsoleComponent,
    UserActivityListenerComponent,
    CountdownPipe,
  ],
  providers: [UnsubscriberService],
  templateUrl: './console-page.component.html',
  styleUrl: './console-page.component.scss'
})
export class ConsolePageComponent implements AfterViewInit {
  // services
  private readonly consolesApi = inject(ConsolesService);
  private readonly friendlyDates = inject(FriendlyDatesService);
  private readonly now = inject(NowService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly title = inject(AppTitleService);

  // models and component state
  protected consoleConfig = model<ConsoleComponentConfig | undefined>(undefined);
  protected consoleComponent = viewChild(ConsoleComponent);
  private consoleId: Signal<ConsoleId | undefined> = toSignal(this.route.queryParamMap.pipe(map(qps => {
    if (qps.has("challengeId") && qps.has("console")) {
      return { challengeId: qps.get("challengeId") || "", name: qps.get("console") || "" };
    }

    return undefined;
  })));
  private readonly consoleIsConnected = signal<boolean>(false);
  protected readonly consoleIsViewOnly = model<boolean>(false);
  protected readonly enableActivityListener = toSignal(this.route.queryParamMap.pipe(map(qps => qps?.get("l") === "true")));

  // NOTE: this query param doesn't solely dictate whether the user can interact with the console - they still have to have logical permission to do that
  // (expressed in the "isViewOnly" property of the response from the API below). This param just forces view-only even if the user _could_
  // interact with this console otherwise (say, if they opened it from the admin observe mode, but it's their own console they're observing.) This forces
  // the user to intentionally interact with a player-facing console in order to start messing with it.
  protected readonly forceViewOnly = toSignal(this.route.queryParamMap.pipe(map(qps => qps?.get("viewOnly") === "true")));

  // we have to wrap the value in an RXJS timer thing to get it to count down correctly (we should maybe reevaluate the countdown pipe)
  private _expiresAtTimestamp?: number;
  protected expiresAt = toSignal(interval(1000).pipe(map(() => {
    if (!this._expiresAtTimestamp) {
      return undefined;
    }

    return this._expiresAtTimestamp - this.now.nowToMsEpoch();
  })));

  async ngAfterViewInit(): Promise<void> {
    await this.connect(this.consoleId()!);
  }

  protected async handleConsoleReconnectRequest() {
    try {
      this.toastService.showMessage(`Reconnecting to **${this.consoleId()?.name}**...`);
      await this.connect(this.consoleId()!);
      this.toastService.showMessage(`Reconnected to **${this.consoleId()?.name}**!`);
    }
    catch (err) {
      this.toastService.showMessage(`Error: ${err}`);
    }
  }

  protected handleConsoleConnectionStatusChanged(status?: ConsoleConnectionStatus) {
    this.consoleIsConnected.update(() => status === "connected");
  }

  protected async handleUserActivity(ev: ConsoleUserActivityType) {
    if (!this.consoleIsViewOnly() && this.consoleId() && this.consoleIsConnected()) {
      const response = await this.consolesApi.logUserActivity(this.consoleId()!, ev);

      if (response.sessionAutoExtended) {
        this.toastService.showMessage(`Your session was automatically extended! It now ends at **${this.friendlyDates.toFriendlyDateAndTime(response.sessionExpiresAt)}**.`);
      }
    }
  }

  @HostListener('window:focus', ['$event'])
  protected async onGainedFocus(event: Event): Promise<void> {
    const consoleId = this.consoleId();
    if (!consoleId) {
      return;
    }

    if (this.consoleIsConnected()) {
      await this.consolesApi.setConsoleActiveUser(consoleId);
    }
  }

  private async connect(consoleId: ConsoleId) {
    const consoleData = await this.consolesApi.getConsole(consoleId.challengeId, consoleId.name);
    const consoleState = consoleData.consoleState;

    this.title.set(`${consoleState.id.name} :: Console${consoleData.isViewOnly ? ' [view only]' : ''}`);
    this.consoleIsViewOnly.update(() => !!this.forceViewOnly() || consoleData.isViewOnly);
    this._expiresAtTimestamp = consoleData.expiresAt?.toMillis();

    this.consoleConfig.update(() => ({
      autoFocusOnConnect: true,
      credentials: {
        accessTicket: consoleState.accessTicket
      },
      url: consoleState.url
    }));

    if (this.consoleComponent()) {
      await this.consoleComponent()!.connect(this.consoleConfig()!);
      await this.consolesApi.setConsoleActiveUser(consoleId);
    }
  }
}
