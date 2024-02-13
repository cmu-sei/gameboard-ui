import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ReportKey } from '@/reports/reports-models';
import { BrowserService } from './browser.service';
import { ObjectService } from './object.service';
import { VmState } from '@/api/board-models';
import { PlayerMode } from '@/api/player-models';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUser } from '@/utility/user.service';
import { slug } from "@/tools/functions";

export interface RouterUrlOptions {
  asAbsolute?: boolean;
  queryParameters?: { [key: string]: string; };
}

export interface QueryParamsUpdate {
  parameters: Params,
  resetParams?: string[]
}

@Injectable({ providedIn: 'root' })
export class RouterService implements OnDestroy {
  private _navEndSub?: Subscription;

  constructor(
    private browser: BrowserService,
    private config: ConfigService,
    private localUser: LocalUser,
    public route: ActivatedRoute,
    public router: Router,
    private objectService: ObjectService) { }

  public getCurrentPathBase(options?: RouterUrlOptions): string {
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    return urlTree.toString();
  }

  public getCurrentQueryParams(): Params {
    return this.route.queryParams;
  }

  public goHome(): void {
    this.router.navigateByUrl("/");
  }

  public getAdminChallengeUrl(challengeId: string, options?: RouterUrlOptions) {
    const absoluteUrlOptionalPath = options?.asAbsolute ? this.config.basehref + this.getCurrentPathBase() : "";
    return this.router.createUrlTree([absoluteUrlOptionalPath, "admin", "support"], { queryParams: { search: challengeId } }).toString();
  }

  public getAdminGamePlayerUrl(gameId: string, playerId: string) {
    return this.router.createUrlTree(["admin", "registrar", gameId], { queryParams: { term: playerId } });
  }

  public getCertificatePrintableUrl(mode: PlayerMode, challengeSpecOrGameId: string) {
    const localUserId = this.localUser.user$.value?.id;

    if (!localUserId) {
      throw new Error("Can't navigate to printable certificate if not authenticated.");
    }

    return `/user/${localUserId}/certificates/${mode}/${challengeSpecOrGameId}`;
  }

  public getPracticeAreaWithSearchUrl(searchTerm: string) {
    return this.router.createUrlTree(["practice"], { queryParams: { term: searchTerm } });
  }

  public getProfileUrl() {
    return this.router.createUrlTree(["user", "profile"]).toString();
  }

  public getReportRoute<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): UrlTree {
    return this.router.createUrlTree(["reports", key], { queryParams: query ? this.objectService.cloneTruthyAndZeroKeys(query) : null });
  }

  public getTicketUrl(ticketKey: string) {
    return this.router.createUrlTree(["support", "tickets", ticketKey]);
  }

  public toChallenge(challengeId: string, playerId: string) {
    return this.router.navigateByUrl(`/board/${playerId}/${challengeId}`);
  }

  public toPracticeArea() {
    return this.router.navigateByUrl("/practice");
  }

  public toPracticeAreaWithSearch(search: string) {
    return this.router.navigateByUrl(this.getPracticeAreaWithSearchUrl(search));
  }

  public toPracticeCertificates() {
    return this.router.navigateByUrl("/user/certificates/practice");
  }

  public toPracticeChallenge(challengeSpec: { id: string, name: string }) {
    return this.router.navigateByUrl(`/practice/${challengeSpec.id}/${slug(challengeSpec.name)}`);
  }

  public toCertificatePrintable(mode: PlayerMode, challengeSpecOrGameId: string) {
    return this.router.navigateByUrl(this.getCertificatePrintableUrl(mode, challengeSpecOrGameId));
  }

  public toReport<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): Promise<boolean> {
    return this.router.navigateByUrl(this.getReportRoute(key, query));
  }

  public toSupportTickets(highlightTicketKey: string) {
    return this.router.navigateByUrl(this.router.parseUrl(`/support/tickets/${highlightTicketKey}`));
  }

  public buildVmConsoleUrl(vm: VmState, isPractice = false) {
    if (!vm || !vm.isolationId || !vm.name) {
      throw new Error(`Can't launch a VM console without an isolationId and a name.`);
    }

    return `${this.config.mkshost}?f=1&s=${vm.isolationId}&v=${vm.name}${isPractice ? "&l=true" : ""}`;
  }

  public toVmConsole(vm: VmState) {
    this.browser.showTab(this.buildVmConsoleUrl(vm));
  }

  public deleteQueryParams(): Promise<boolean> {
    return this.router.navigateByUrl(this.router.createUrlTree([this.getCurrentPathBase()]));
  }

  public getExternalGamePageUrlTree(ctx: { gameId: string, teamId: string }) {
    return this.router.createUrlTree(["game", "external", ctx.gameId, ctx.teamId]);
  }

  public goToExternalGamePage(gameId: string, teamId: string) {
    this.router.navigateByUrl(this.getExternalGamePageUrlTree({ gameId, teamId }));
  }

  public getExternalGameLoadingPageUrlTree(ctx: { gameId: string, playerId: string }) {
    return this.router.createUrlTree(["game", "external", ctx.gameId, "start", ctx.playerId]);
  }

  public goToExternalGameLoadingPage(ctx: { gameId: string, playerId: string }) {
    this.router.navigateByUrl(this.getExternalGameLoadingPageUrlTree(ctx));
  }

  public getGameboardPageUrlTree(playerId: string): UrlTree {
    return this.router.createUrlTree(["game", "board", playerId]);
  }

  public getGamePageUrlTree(gameId: string): UrlTree {
    return this.router.parseUrl(`/game/${gameId}`);
  }

  public goToGamePage(gameId: string) {
    this.router.navigateByUrl(this.getGamePageUrlTree(gameId));
  }

  public getUnityBoardUrlTree(ctx: { gameId: string, playerId: string, teamId: string; sessionEnd: number }) {
    return this.router.createUrlTree(["game", "unity-board", ctx.gameId, ctx.playerId, ctx.teamId, ctx.sessionEnd]);
  }

  public reloadOnNextNavigateEnd() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      window.location = window.location;
    });
  }

  public updateQueryParams(update: QueryParamsUpdate): Promise<boolean> {
    const cleanParams = this.objectService.cloneTruthyAndZeroKeys({ ...this.route.snapshot.queryParams, ...update.parameters });

    // delete requested keys (for example, if we're updating the `term` query param, we might need to reset paging)
    if (update.resetParams?.length) {
      for (const resetParam of update.resetParams) {
        delete cleanParams[resetParam];
      }
    }

    const updatedParams = { ...cleanParams, ...update.parameters };
    const urlTree = this.router.createUrlTree([this.getCurrentPathBase()], { queryParams: updatedParams });
    return this.router.navigateByUrl(urlTree);
  }

  ngOnDestroy(): void {
    this._navEndSub?.unsubscribe();
  }
}
