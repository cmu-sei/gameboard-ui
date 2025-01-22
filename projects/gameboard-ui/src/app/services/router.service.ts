import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ReportKey } from '@/reports/reports-models';
import { PlayerMode } from '@/api/player-models';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUser } from '@/utility/user.service';
import { slug } from "@/../tools/functions";
import { GameCenterTab } from '@/admin/components/game-center/game-center.models';
import { SimpleEntity } from '@/api/models';
import { ObjectService } from './object.service';

export interface QueryParamsUpdate {
  parameters?: Params,
  resetParams?: string[]
}

@Injectable({ providedIn: 'root' })
export class RouterService implements OnDestroy {
  private _navEndSub?: Subscription;

  constructor(
    private config: ConfigService,
    private localUser: LocalUser,
    private objectService: ObjectService,
    public route: ActivatedRoute,
    private router: Router) { }

  public getCurrentPathBase(): string {
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

  public getAdminChallengeUrl(challengeId: string) {
    return this.buildAppUrlWithQueryParams({ queryParams: { search: challengeId } }, "admin", "support").toString();
  }

  public getAdminGamePlayerUrl(gameId: string, teamId: string) {
    return this.buildAppUrlWithQueryParams({ queryParams: { search: teamId } }, "admin", "game", gameId, "teams").toString();
  }

  public getCertificatePrintableUrl(mode: PlayerMode, challengeSpecOrGameId: string) {
    const localUserId = this.localUser.user$.value?.id;

    if (!localUserId) {
      throw new Error("Can't navigate to printable certificate if not authenticated.");
    }

    return `user/${localUserId}/certificates/${mode}/${challengeSpecOrGameId}`;
  }

  public getCertificateListUrl() {
    return "user/certificates";
  }

  public getLocation() {
    return this.router.url;
  }

  public getGameCenterUrl(gameId: string, tab?: GameCenterTab) {
    return this.router.parseUrl(`/admin/game/${gameId}` + (tab ? '/' + tab : ""));
  }

  public getObserveChallengeUrl(gameId: string, challengeId: string) {
    return `admin/game/${gameId}/observe?mode=challenge&gid=${gameId}&search=${challengeId}`;
  }

  public getObserveTeamsUrl(gameId: string, teamId: string) {
    return `admin/game/${gameId}/observe?mode=team&gid=${gameId}&search=${teamId}`;
  }

  public getPlayHistoryUrl() {
    return "user/profile/history";
  }

  public getPracticeAreaUrl(searchTerm?: string) {
    const params: Params = {};

    if (searchTerm) {
      params.term = searchTerm;
    }

    return this.router.createUrlTree(["practice"], { queryParams: params });
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

  public toCertificatePrintableWithName(request: { userId: string, mode: PlayerMode, awardedForEntityId: string, name: string }) {
    return this.router.navigateByUrl(`/user/${request.userId}/certificates/${request.mode}/${request.awardedForEntityId}?=requestedNameOverride=${request.name}`);
  }

  public toPracticeArea() {
    return this.router.navigateByUrl("/practice");
  }

  public toPracticeAreaWithSearch(search: string) {
    return this.router.navigateByUrl(this.getPracticeAreaUrl(search));
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

  public toGameCenter(gameId: string, selectedTab?: GameCenterTab) {
    return this.getGameCenterUrl(gameId, selectedTab);
  }

  public toReport<T extends { [key: string]: any }>(key: ReportKey, query: T | null = null): Promise<boolean> {
    return this.router.navigateByUrl(this.getReportRoute(key, query));
  }

  public toSupportTickets(highlightTicketKey: string) {
    return this.router.navigateByUrl(this.router.parseUrl(`/support/tickets/${highlightTicketKey}`));
  }

  public buildVmConsoleUrl(challengeId: string, vm: SimpleEntity, isPractice = false) {
    if (!vm || !challengeId) {
      throw new Error(`Can't launch a VM console without a challengeId.`);
    }

    return `${this.config.mkshost}?f=1&s=${challengeId}&v=${vm.name || 'Console'}${isPractice ? "&l=true" : ""}`;
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

  public getGamePageUrl(gameId: string) {
    return this.buildAppUrl("game", gameId);
  }

  public goToGamePage(gameId: string) {
    this.router.navigateByUrl(this.getGamePageUrl(gameId).toString());
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

  private buildAppUrl(...urlBits: string[]) {
    return this.buildAppUrlWithQueryParams(null, ...urlBits);
  }

  private buildAppUrlWithQueryParams(queryParams: any, ...urlBits: string[]) {
    return this.router.createUrlTree([this.config.basehref || "", ...urlBits], { ...queryParams });
  }

  ngOnDestroy(): void {
    this._navEndSub?.unsubscribe();
  }
}
