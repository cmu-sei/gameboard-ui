import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, UrlTree } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouterService implements OnDestroy {
  private _navEndSub?: Subscription;

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

  public goToExternalGamePage(gameId: string, teamId: string) {
    this.router.navigateByUrl(`/game/external/${gameId}/${teamId}`);
  }

  public getGamePageUrlTree(gameId: string): UrlTree {
    return this.router.parseUrl(`/game/${gameId}`);
  }

  public goToGamePage(gameId: string) {
    this.router.navigateByUrl(this.getGamePageUrlTree(gameId));
  }

  public getGameStartPageUrlTree(ctx: { gameId: string, playerId: string }) {
    return this.router.parseUrl(`/game/${ctx.gameId}/start/${ctx.playerId}`);
  }

  public goToGameStartPage(ctx: { gameId: string, playerId: string }) {
    this.router.navigateByUrl(this.getGameStartPageUrlTree(ctx));
  }

  public reloadOnNextNavigateEnd() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      window.location = window.location;
    });
  }

  ngOnDestroy(): void {
    this._navEndSub?.unsubscribe();
  }
}
