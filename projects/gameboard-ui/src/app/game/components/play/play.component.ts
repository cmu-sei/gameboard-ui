import { Component, Input, SimpleChanges } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { firstValueFrom, from, switchMap, tap } from 'rxjs';
import { LocalActiveChallenge } from '@/api/challenges.models';
import { BoardPlayer, BoardSpec } from '@/api/board-models';
import { BoardService } from '@/api/board.service';
import { TimeWindow } from '@/api/player-models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { SpecSummary } from '@/api/spec-models';

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
  styleUrls: ['./play.component.scss']
})
export class PlayComponent {
  @Input() playerContext: { playerId: string, userId: string } | null = null;
  @Input() challengeSpec: SpecSummary | null = null;
  @Input() autoPlay = false;

  protected challenge: LocalActiveChallenge | null = null;
  protected fa = fa;
  protected legacyContext: LegacyContext = { boardPlayer: null, boardSpec: null, session: null };
  protected isDeploying = false;
  protected vmUrls: { [id: string]: string } = {};

  constructor(
    private activeChallengesRepo: ActiveChallengesRepo,
    private boardService: BoardService,
    private challengesService: ChallengesService,
    private routerService: RouterService,
    private unsub: UnsubscriberService) {
    this.unsub.add(
      this.activeChallengesRepo.activePracticeChallenge$.pipe(
        tap(challenge => this.challenge = challenge),
        tap(challenge => this.buildVmLinks(challenge)),
        switchMap(challenge => from(this._buildLegacyContext(challenge))),
      ).subscribe(legacyContext => {
        this.legacyContext = legacyContext;
      })
    );
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.challengeSpec && this.playerContext) {
      if (this.autoPlay) {
        this.isDeploying = true;
        const activeChallenge = await firstValueFrom(this.challengesService.startPlaying({
          specId: this.challengeSpec.id,
          playerId: this.playerContext.playerId,
          userId: this.playerContext.userId
        }));
        this.isDeploying = false;

        this.vmUrls = this.buildVmLinks(activeChallenge);
      }
    } else {
      this.legacyContext = {
        boardPlayer: null,
        boardSpec: null,
        session: null
      };
      this.vmUrls = {};
    }
  }

  protected async deploy(challengeId: string) {
    if (!challengeId) {
      throw new Error("Can't deploy from the Play component without a challenge object.");
    }

    this.isDeploying = true;
    const challenge = await firstValueFrom(this.challengesService.deploy({ id: challengeId }));

    this.isDeploying = false;
  }

  protected async undeploy(challengeId: string) {
    this.isDeploying = true;
    await firstValueFrom(this.challengesService.undeploy({ id: challengeId }));
    this.isDeploying = false;
  }

  private buildVmLinks(challenge: LocalActiveChallenge | null) {
    const vmUrls: { [id: string]: string } = {};

    if (!challenge)
      return vmUrls;

    for (let vm of challenge.challengeDeployment.vms) {
      vmUrls[vm.id] = this.routerService.buildVmConsoleUrl(vm);
    }

    return vmUrls;
  }

  private async _buildLegacyContext(challenge: LocalActiveChallenge | null): Promise<LegacyContext> {
    // longterm, we'll replace this whole loading-a-board-player thing with something less dependent on prior architecture, but
    // in order to get Practice Mode off the ground, we'll reuse this for now
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
