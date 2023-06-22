import { ReportKey } from '@/reports/reports-models';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiUrlService } from './api-url.service';

@Injectable({ providedIn: 'root' })
export class RouterService {
  constructor(public router: Router, private apiUri: ApiUrlService) { }

  public goHome(): void {
    this.router.navigateByUrl("/");
  }

  public getReportRoute<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): string {
    return `/reports/${key}${this.apiUri.objectToQuery(query)}`;
  }

  public toReport<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): void {
    this.router.navigateByUrl(this.getReportRoute(key, query));
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
