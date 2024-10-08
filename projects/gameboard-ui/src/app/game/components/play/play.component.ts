import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { ChallengeSolutionGuide, LocalActiveChallenge } from '@/api/challenges.models';
import { BoardPlayer, BoardSpec } from '@/api/board-models';
import { BoardService } from '@/api/board.service';
import { PlayerMode, TimeWindow } from '@/api/player-models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { SpecSummary } from '@/api/spec-models';
import { WindowService } from '@/services/window.service';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';

type LegacyContext = {
  boardPlayer: BoardPlayer | null,
  boardSpec: BoardSpec | null,
  session: TimeWindow | null
};

export type PlayerContext = {
  playerId: string;
  userId: string;
}

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  providers: [UnsubscriberService]
})
export class PlayComponent {
  @Input() playerContext: { playerId: string, userId: string } | null = null;
  @Input() challengeSpec: SpecSummary | null = null;
  @Input() autoPlay = false;
  @Output() challengeStarted = new EventEmitter<void>();
  @Output() deployStatusChanged = new EventEmitter<boolean>();

  protected challenge: LocalActiveChallenge | null = null;
  protected errors: any[] = [];
  protected fa = fa;
  protected legacyContext: LegacyContext = { boardPlayer: null, boardSpec: null, session: null };
  protected isDeploying = false;
  protected isMiniPlayerAvailable = false;
  protected isMiniPlayerSelected = false;
  protected isUndeploying = false;
  protected showMiniPlayerPrompt = false;
  protected solutionGuide: ChallengeSolutionGuide | null = null;
  protected vmUrls: { [id: string]: string } = {};
  protected windowWidth$: Observable<number>;

  private _autobootedForPlayerId?: string;

  constructor(
    private activeChallengesRepo: ActiveChallengesRepo,
    private boardService: BoardService,
    private challengesService: ChallengesService,
    private localStorage: LocalStorageService,
    private routerService: RouterService,
    private unsub: UnsubscriberService,
    windowService: WindowService) {
    this.windowWidth$ = windowService.resize$;
    this.unsub.add(
      this.activeChallengesRepo.activePracticeChallenge$.pipe(
        tap(challenge => this.challenge = challenge),
        tap(async challenge => this.legacyContext = await this._buildLegacyContext(challenge)),
        tap(challenge => this.vmUrls = this.buildVmLinks(challenge)),
      ).subscribe(),

      windowService.resize$.subscribe(width => {
        this.isMiniPlayerAvailable = width >= 1140;
        this.isMiniPlayerSelected = this.localStorage.get(StorageKey.UsePlayPane) === "true";
        this.showMiniPlayerPrompt = this.localStorage.get(StorageKey.UsePlayPane) === null;

        if (!this.isMiniPlayerAvailable && this.isMiniPlayerSelected)
          this.toggleMiniPlayer();
      })
    );
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.playerContext?.playerId) {
      this.legacyContext = {
        boardPlayer: null,
        boardSpec: null,
        session: null
      };

      this.vmUrls = {};
    }

    // if the player record has changed since the last autoboot, reset it
    // (this happens if the player ends the session and restarts it from the same page)
    if (this.playerContext && this.challengeSpec && this._autobootedForPlayerId !== this.playerContext.playerId) {
      await this.deployChallenge({
        challengeSpecId: this.challengeSpec.id,
        playerId: this.playerContext.playerId,
        userId: this.playerContext.userId
      });
    }
  }

  protected async deployVms(challengeId: string) {
    if (!challengeId) {
      throw new Error("Can't deploy from the Play component without a challenge object.");
    }

    this.isDeploying = true;
    this.deployStatusChanged.emit(true);
    await firstValueFrom(this.challengesService.deploy({ id: challengeId }));
    this.isDeploying = false;
    this.deployStatusChanged.emit(false);
  }

  protected async undeployVms(challengeId: string) {
    this.isUndeploying = true;
    await firstValueFrom(this.challengesService.undeploy({ id: challengeId }));
    this.isUndeploying = false;
  }

  protected toggleMiniPlayer() {
    this.showMiniPlayerPrompt = false;
    if (this.isMiniPlayerAvailable) {
      this.isMiniPlayerSelected = !this.isMiniPlayerSelected;
      this.localStorage.add(StorageKey.UsePlayPane, this.isMiniPlayerSelected);

    }
    else {
      this.isMiniPlayerSelected = false;
      this.localStorage.add(StorageKey.UsePlayPane, false);
    }
  }

  private buildVmLinks(challenge: LocalActiveChallenge | null) {
    const vmUrls: { [id: string]: string } = {};

    if (!challenge)
      return vmUrls;

    for (const vm of challenge.challengeDeployment.vms) {
      vmUrls[vm.id] = this.routerService.buildVmConsoleUrl(vm, challenge.playerMode == PlayerMode.practice);
    }

    return vmUrls;
  }

  private async deployChallenge(args: { challengeSpecId: string, playerId: string, userId: string }) {
    this.errors = [];
    this.solutionGuide = null;
    this.deployStatusChanged.emit(true);
    this.isDeploying = true;

    this.challenge = await firstValueFrom(this.challengesService.startPlaying({
      specId: args.challengeSpecId,
      playerId: args.playerId,
      userId: args.userId
    })
      .pipe(
        catchError(err => {
          this.errors.push(err);
          return of(null);
        })
      ));

    this.isDeploying = false;
    this.deployStatusChanged.emit(false);

    if (this.challenge) {
      // if we succeeded in booting, let listeners know
      this._autobootedForPlayerId = args.playerId;
      this.challengeStarted.emit();

      // also look up the solution guide if there is one
      this.solutionGuide = await firstValueFrom(this.challengesService.getSolutionGuide(this.challenge.id));
    }
  }

  private async _buildLegacyContext(challenge: LocalActiveChallenge | null): Promise<LegacyContext> {
    // longterm, we'll replace this whole loading-a-board-player thing with something less dependent on prior architecture, but
    // in order to get the Practice Area off the ground, we'll reuse this for now
    if (!challenge) {
      return {
        boardPlayer: null,
        boardSpec: null,
        session: null
      };
    }

    const boardPlayer = await firstValueFrom(this.boardService.load(challenge.player.id));
    return {
      boardPlayer: boardPlayer,
      boardSpec: boardPlayer.game.specs.find(s => challenge!.spec.id === s.id) || null,
      session: challenge.session.toLegacyTimeWindow(),
    };
  }
}
