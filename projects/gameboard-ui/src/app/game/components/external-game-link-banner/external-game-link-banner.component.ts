import { GameEngineMode, GamePlayState } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { RouterService } from '@/services/router.service';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-external-game-link-banner',
  templateUrl: './external-game-link-banner.component.html',
  styleUrls: ['./external-game-link-banner.component.scss']
})
export class ExternalGameLinkBannerComponent implements OnInit {
  @Input() gameId?: string;
  @Input() teamId?: string;

  protected isExternalGameReady$?: Observable<boolean>;
  protected teamLinkToExternalGame = "";

  constructor(
    private gameService: GameService,
    private routerService: RouterService) { }

  ngOnInit(): void {
    if (!this.gameId || !this.teamId) {
      throw new Error("Can't display external game link banner without gameId and teamId inputs.");
    }

    this.teamLinkToExternalGame = this
      .routerService
      .getExternalGamePageUrlTree({ gameId: this.gameId!, teamId: this.teamId! })
      .toString();

    this.isExternalGameReady$ = combineLatest([
      this.gameService.retrieve(this.gameId),
      this.gameService.getGamePlayState(this.gameId, this.teamId)
    ]).pipe(
      map(([game, playState]) => ({ mode: game.mode, playState })),
      map(modeAndPlayState => modeAndPlayState.mode == GameEngineMode.External && modeAndPlayState.playState == GamePlayState.Started)
    );
  }
}
