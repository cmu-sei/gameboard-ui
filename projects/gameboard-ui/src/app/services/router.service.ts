import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouterService implements OnDestroy {
  private _navEndSub?: Subscription;

  constructor(public router: Router) { }

  public goHome(): void {
    this.router.navigateByUrl("/");
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

  public goToExternalGamePage(gameId: string) {
    this.router.navigateByUrl(`/game/external/${gameId}`);
  }

  public goToGamePage(gameId: string) {
    this.router.navigateByUrl(`/game/${gameId}`);
  }

  public goToGameStartPage(ctx: { gameId: string, playerId: string }) {
    this.router.navigateByUrl(`/game/${ctx.gameId}/start/${ctx.playerId}`);
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
