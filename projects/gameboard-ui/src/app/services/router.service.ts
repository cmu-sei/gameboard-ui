import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterService {

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
}
