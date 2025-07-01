import { AfterViewInit, Component, HostListener, inject, model, Signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from "@angular/core/rxjs-interop";
import { ConsoleComponent, ConsoleComponentConfig } from "@cmusei/console-forge";
import { DateTime } from 'luxon';
import { map } from 'rxjs';
import { UserActivityListenerComponent } from '../user-activity-listener/user-activity-listener.component';
import { ConsolesService } from '@/api/consoles.service';
import { ConsoleId, ConsoleUserActivityType } from '@/api/consoles.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { AppTitleService } from '@/services/app-title.service';
import { ToastService } from '@/utility/services/toast.service';
import { ConfigService } from '@/utility/config.service';
import { FriendlyDatesService } from '@/services/friendly-dates.service';
import { CountdownPipe } from '@/core/pipes/countdown.pipe';

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
  private readonly config = inject(ConfigService);
  private readonly consolesApi = inject(ConsolesService);
  private readonly friendlyDates = inject(FriendlyDatesService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly title = inject(AppTitleService);

  protected consoleConfig = model<ConsoleComponentConfig | undefined>(undefined);
  protected consoleComponent = viewChild(ConsoleComponent);
  private consoleId: Signal<ConsoleId | undefined> = toSignal(this.route.queryParamMap.pipe(map(qps => {
    if (qps.has("challengeId") && qps.has("console")) {
      return { challengeId: qps.get("challengeId") || "", name: qps.get("console") || "" };
    }

    return undefined;
  })));
  protected consoleIsViewOnly = model<boolean>(false);
  protected enableActivityListener = toSignal(this.route.queryParamMap.pipe(map(qps => qps?.get("l") === "true")));
  protected expiresAt = model<number>();

  async ngAfterViewInit(): Promise<void> {
    await this.connect(this.consoleId()!);
  }

  protected async handleConsoleReconnectRequest(config: ConsoleComponentConfig) {
    await this.connect(this.consoleId()!);
  }

  protected async handleUserActivity(ev: ConsoleUserActivityType) {
    if (!this.consoleIsViewOnly() && this.consoleId()) {
      const response = await this.consolesApi.logUserActivity(this.consoleId()!, ev);

      if (response.sessionAutoExtended) {
        this.toastService.showMessage(`Your session was automatically extended! It now ends at **${this.friendlyDates.toFriendlyDateAndTime(response.sessionExpiresAt)}**.`);
      }

      // if (response.sessionExpiresAt) {
      //   this.expiresAt.update(() => response.sessionExpiresAt.toMillis());
      // }
    }
  }

  // protected onConsoleConnectionStateChange(state: { isConnected: boolean }) {
  //   this.toastService.showMessage(`Console **${state.isConnected ? "connected" : "disconnected"}**.`);
  // }

  @HostListener('window:focus', ['$event'])
  protected async onGainedFocus(event: Event): Promise<void> {
    const consoleId = this.consoleId();
    if (!consoleId) {
      return;
    }

    await this.consolesApi.setConsoleActiveUser(consoleId);
  }

  private async connect(consoleId: ConsoleId) {
    const consoleData = await this.consolesApi.getConsole(consoleId.challengeId, consoleId.name);
    const consoleState = consoleData.consoleState;

    this.title.set(`${consoleState.id.name} : ${this.config.appName} Console${consoleData.isViewOnly ? '[view only]' : ''}`);
    this.consoleIsViewOnly.update(() => consoleData.isViewOnly);
    this.updateConsoleExpirationTime(consoleData.expiresAt);

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

  private updateConsoleExpirationTime(consoleExpiresAt: DateTime | null) {
    if (consoleExpiresAt) {
      this.expiresAt.update(() => consoleExpiresAt.toMillis() - DateTime.now().toMillis());
    }
  }
}
