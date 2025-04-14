import { Component, computed, HostListener, inject, model, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from 'rxjs';
import { ConsoleComponent, ConsoleComponentConfig } from 'gameboard-consoles';
import { UserActivityListenerComponent } from '../user-activity-listener/user-activity-listener.component';
import { ConsolesService } from '@/api/consoles.service';
import { ConsoleId, ConsoleUserActivityType } from '@/api/consoles.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { AppTitleService } from '@/services/app-title.service';
import { DateTime } from 'luxon';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-console-page',
  standalone: true,
  imports: [
    ConsoleComponent,
    UserActivityListenerComponent
  ],
  providers: [UnsubscriberService],
  templateUrl: './console-page.component.html',
  styleUrl: './console-page.component.scss'
})
export class ConsolePageComponent {
  private readonly consolesApi = inject(ConsolesService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly title = inject(AppTitleService);
  private readonly unsub = inject(UnsubscriberService);

  protected consoleConfig = model<ConsoleComponentConfig | undefined>(undefined);
  private consoleId: Signal<ConsoleId | undefined> = toSignal(this.route.queryParamMap.pipe(map(qps => {
    if (qps.has("challengeId") && qps.has("console")) {
      return { challengeId: qps.get("challengeId") || "", name: qps.get("console") || "" };
    }

    return undefined;
  })));
  protected enableActivityListener = toSignal(this.route.queryParamMap.pipe(map(qps => qps?.get("l") === "true")));

  constructor() {
    this.unsub.add(this.route.queryParamMap.subscribe(async qp => {
      const consoleId = this.consoleId();

      if (!consoleId) {
        return;
      }

      const consoleData = await this.consolesApi.getConsole(consoleId.challengeId, consoleId.name);
      this.title.set(`${consoleData.id.name} (console)`);
      this.consoleConfig.update(v => ({
        ...v,
        id: `${consoleData.id.name}#${consoleData.id.challengeId}`,
        autofocus: true,
        accessCredential: consoleData.accessTicket,
        isReadOnly: false,
        url: consoleData.url,
      }));
    }));
  }

  protected async handleUserActivity(ev: ConsoleUserActivityType) {
    await this.consolesApi.logUserActivity(ev);
  }

  protected onConsoleConnectionStateChange(state: { isConnected: boolean }) {
    this.toastService.showMessage(`Console **${state.isConnected ? "connected" : "disconnected"}**.`);
  }

  @HostListener('window:focus', ['$event'])
  protected async onGainedFocus(event: Event): Promise<void> {
    const consoleId = this.consoleId();
    if (!consoleId) {
      return;
    }

    await this.consolesApi.setConsoleActiveUser(consoleId);
  }
}
