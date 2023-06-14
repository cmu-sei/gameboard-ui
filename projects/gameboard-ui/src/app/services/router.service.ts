import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterService {
  constructor(public router: Router) { }

  public goHome(): void {
    this.router.navigateByUrl("/");
  }

  public toSupportTickets(highlightTicketKey: string) {
    return this.router.navigateByUrl(this.router.parseUrl(`/support/tickets/${highlightTicketKey}`));
  }

  public tryGoBack() {
    const prevUrl = this.router.getCurrentNavigation()?.previousNavigation?.initialUrl;
    if (prevUrl) {
      this.router.navigateByUrl(prevUrl);
    }
    else {
      this.router.navigateByUrl("/");
    }
  }
}
