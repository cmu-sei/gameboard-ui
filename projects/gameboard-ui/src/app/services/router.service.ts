import { ReportKey } from '@/reports/reports-models';
import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ObjectService } from './object.service';

@Injectable({ providedIn: 'root' })
export class RouterService {
  constructor(
    public router: Router,
    private objectService: ObjectService) { }

  public goHome(): void {
    this.router.navigateByUrl("/");
  }

  public getReportRoute<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): UrlTree {
    return this.router.createUrlTree(["reports", key], { queryParams: query ? this.objectService.cloneTruthyAndZeroKeys(query) : null });
  }

  public toReport<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): Promise<boolean> {
    return this.router.navigateByUrl(this.getReportRoute(key, query));
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
