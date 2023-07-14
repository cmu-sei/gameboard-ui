import { ReportKey } from '@/reports/reports-models';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { ObjectService } from './object.service';
import { LogService } from './log.service';

export interface QueryParamsUpdate {
  parameters: Params,
  navigate?: boolean,
  resetParams?: string[]
}

@Injectable({ providedIn: 'root' })
export class RouterService {
  constructor(
    private logService: LogService,
    public router: Router,
    private route: ActivatedRoute,
    private objectService: ObjectService) { }

  public getCurrentPathBase(): string {
    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  public getCurrentQueryParams(): Params {
    return this.route.queryParams;
  }

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

  public updateQueryParams(update: QueryParamsUpdate): Promise<boolean> {
    if (this.router.getCurrentNavigation()) {
      // router is currently performing navigation, don't mess with it
      this.logService.logError("Navigation to query params flushed by the router service:", update);
      return Promise.resolve(false);
    }

    const cleanParams = this.objectService.cloneTruthyAndZeroKeys({ ...this.route.snapshot.queryParams, ...update.parameters });

    // delete requested keys (for example, if we're updating the `term` query param, we might need to reset paging)
    if (update.resetParams?.length) {
      for (const resetParam of update.resetParams) {
        delete cleanParams[resetParam];
      }
    }

    const urlTree = this.router.createUrlTree([this.getCurrentPathBase()], { queryParams: cleanParams });

    if (update.navigate || false)
      return this.router.navigateByUrl(urlTree);

    return new Promise((resolve, reject) => true);
  }
}
