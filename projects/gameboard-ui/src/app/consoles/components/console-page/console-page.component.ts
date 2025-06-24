import { AfterViewChecked, AfterViewInit, Component, computed, effect, HostListener, inject, model, Signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from 'rxjs';
import { ConsoleComponent, ConsoleComponentConfig } from "@cmusei/console-forge";
import { UserActivityListenerComponent } from '../user-activity-listener/user-activity-listener.component';
import { ConsolesService } from '@/api/consoles.service';
import { ConsoleId, ConsoleUserActivityType } from '@/api/consoles.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { AppTitleService } from '@/services/app-title.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-console-page',
  imports: [
    ConsoleComponent,
    UserActivityListenerComponent
  ],
  providers: [UnsubscriberService],
  templateUrl: './console-page.component.html',
  styleUrl: './console-page.component.scss'
})
export class ConsolePageComponent implements AfterViewInit {
  private readonly consolesApi = inject(ConsolesService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly title = inject(AppTitleService);
  private readonly unsub = inject(UnsubscriberService);

  protected consoleConfig = model<ConsoleComponentConfig | undefined>(undefined);
  protected consoleComponent = viewChild(ConsoleComponent);
  private consoleId: Signal<ConsoleId | undefined> = toSignal(this.route.queryParamMap.pipe(map(qps => {
    if (qps.has("challengeId") && qps.has("console")) {
      return { challengeId: qps.get("challengeId") || "", name: qps.get("console") || "" };
    }

    return undefined;
  })));
  protected enableActivityListener = toSignal(this.route.queryParamMap.pipe(map(qps => qps?.get("l") === "true")));

  constructor() {
    // this.unsub.add(this.route.queryParamMap.subscribe(async qp => {
    //   const consoleId = this.consoleId();

    //   if (!consoleId) {
    //     return;
    //   }

    //   const consoleData = await this.consolesApi.getConsole(consoleId.challengeId, consoleId.name);
    //   this.title.set(`${consoleData.id.name} (console)`);

    //   this.consoleConfig.update(() => ({
    //     autoFocusOnConnect: true,
    //     credentials: {
    //       accessTicket: consoleData.accessTicket
    //     },
    //     url: consoleData.url
    //   }));

    //   // this.consoleConfig.update(v => ({
    //   //   ...v,
    //   //   id: `${consoleData.id.name}#${consoleData.id.challengeId}`,
    //   //   autofocus: true,
    //   //   accessCredential: consoleData.accessTicket,
    //   //   isReadOnly: false,
    //   //   url: consoleData.url,
    //   // }));
    // }));
  }

  async ngAfterViewInit(): Promise<void> {
    const consoleId = this.consoleId()!;
    const consoleData = await this.consolesApi.getConsole(consoleId.challengeId, consoleId.name);

    this.consoleConfig.update(() => ({
      autoFocusOnConnect: true,
      credentials: {
        accessTicket: consoleData.accessTicket
      },
      url: consoleData.url
    }));

    if (this.consoleComponent()) {
      console.log("connecting with", this.consoleConfig());
      this.consoleComponent()!.connect(this.consoleConfig()!);
    }
  }

  protected async handleUserActivity(ev: ConsoleUserActivityType) {
    await this.consolesApi.logUserActivity(ev);
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
}
