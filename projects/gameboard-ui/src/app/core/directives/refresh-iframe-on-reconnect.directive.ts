import { ApiStatusService } from '@/api/api-status.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Directive, ElementRef } from '@angular/core';

@Directive({
  providers: [UnsubscriberService],
  selector: '[appRefreshIframeOnReconnect]'
})
export class RefreshIframeOnReconnectDirective {
  private iframe?: HTMLIFrameElement;

  constructor(
    apiStatusService: ApiStatusService,
    ref: ElementRef,
    unsub: UnsubscriberService) {
    if (!ref?.nativeElement?.contentWindow?.location?.reload())
      throw new Error("Can't use appRefreshIframeOnReconnect with a non-refreshable IFrame.");

    this.iframe = ref.nativeElement;

    unsub.add(apiStatusService.status$.subscribe(status => {
      if (status === "up") {
        console.warn("API went down/came back up. Reloading external game host...");
        this.iframe?.contentWindow?.location?.reload();
        console.warn("Done.");
      }
    }));
  }
}
