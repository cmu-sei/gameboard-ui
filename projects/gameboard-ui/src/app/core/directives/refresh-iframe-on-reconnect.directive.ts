import { ApiStatusService } from '@/api/api-status.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';
import { ToastService } from '@/utility/services/toast.service';
import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  providers: [UnsubscriberService],
  selector: '[appRefreshIframeOnReconnect]'
})
export class RefreshIframeOnReconnectDirective implements AfterViewInit {
  private iframe?: HTMLIFrameElement;

  constructor(
    private apiStatusService: ApiStatusService,
    private config: ConfigService,
    private ref: ElementRef<HTMLIFrameElement>,
    private toastService: ToastService,
    private unsub: UnsubscriberService) { }

  ngAfterViewInit(): void {
    if (!this.ref?.nativeElement?.contentWindow?.location?.reload)
      throw new Error("Can't use appRefreshIframeOnReconnect with a non-refreshable IFrame.");

    this.iframe = this.ref.nativeElement;
    this.unsub.add(this.apiStatusService.status$.subscribe(status => {
      if (status === "up") {
        this.toastService.showMessage(`${this.config.appName} experienced an interruption in service. We're reloading your game to ensure you get the best experience possible.`);
        this.iframe?.contentWindow?.location?.reload();
      }
    }));
  }
}
