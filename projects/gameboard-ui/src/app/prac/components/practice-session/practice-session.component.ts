import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { SpecSummary } from '@/api/spec-models';
import { UserService as LocalUserService } from '@/utility/user.service';
import { fa } from "@/services/font-awesome.service";
import { PracticeService } from '@/services/practice.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { LocalActiveChallenge } from '@/api/challenges.models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { PlayerContext } from '@/game/components/play/play.component';
import { RouterService } from '@/services/router.service';
import { PracticeChallengeSolvedModalComponent } from '../practice-challenge-solved-modal/practice-challenge-solved-modal.component';
import { TeamService } from '@/api/team.service';
import { WindowService } from '@/services/window.service';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
  providers: [UnsubscriberService]
})
export class PracticeSessionComponent {
  protected windowWidth$ = this.windowService.resize$;
  spec$: Observable<SpecSummary>;
  authed$: Observable<boolean>;
  activePracticeChallenge$ = new BehaviorSubject<LocalActiveChallenge | null>(null);

  protected errors: any = [];
  protected fa = fa;
  protected playerContext: PlayerContext | null = null;
  protected isMiniPlayerEnabled = false;
  protected isPlayingOtherChallenge = false;
  protected isStartingSession = false;
  protected isDeploying = false;
  protected showSpecMarkdown = true;

  constructor(
    practiceService: PracticeService,
    private activeChallengesRepo: ActiveChallengesRepo,
    private modalService: ModalConfirmService,
    private localUser: LocalUserService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private teamService: TeamService,
    private unsub: UnsubscriberService,
    private windowService: WindowService,
  ) {
    this.authed$ = localUser.user$.pipe(map(u => !!u));

    this.spec$ = route.params.pipe(
      filter(p => !!p.specId),
      map(p => p.specId),
      distinctUntilChanged(),
      switchMap(p => practiceService.searchChallenges({ term: p })),
      map(r => !r.results.items.length ? ({ name: "Not Found" } as SpecSummary) : r.results.items[0]),
    );

    // if we're actively playing the challenge on _this page_, we don't need to see
    // the spec markdown, because the Play component will display a more extensive
    // doc that may be transformed for the given challenge.
    this.unsub.add(combineLatest([
      this.spec$,
      this.activePracticeChallenge$
    ]).pipe(
      map(([spec, activeChallenge]) => ({ spec, activeChallenge }))
    ).subscribe(ctx => {
      this.showSpecMarkdown = ctx.spec?.id !== ctx.activeChallenge?.spec?.id;
    }));

    this.unsub.add(this.activeChallengesRepo.practiceChallengeCompleted$.subscribe(challenge => {
      this.handleActiveChallengeCompleted(challenge);
    }));

    this.unsub.add(this.activeChallengesRepo.practiceChallengeAttemptsExhausted$.subscribe(challenge => {
      this.handleActiveChallengeAttemptsExhausted(challenge);
    }));

    this.unsub.add(
      this.activeChallengesRepo.activePracticeChallenge$
        .pipe(
          tap(c => {
            if (c)
              this.playerContext = {
                playerId: c.player.id,
                userId: c.user.id
              };
          }),
        ).subscribe(activeChallenge => {
          const previousChallenge = this.activePracticeChallenge$.value;
          this.activePracticeChallenge$.next(activeChallenge);

          // expire the previous challenge if it's over
          if (previousChallenge?.session.isAfter()) {
            this.handleActiveChallengeExpired(previousChallenge);
          }

          this.isPlayingOtherChallenge = (!!this.activePracticeChallenge$.value && this.activePracticeChallenge$.value?.spec.id !== this.route.snapshot.paramMap.get("specId"));
        })
    );
  }

  // the play command is based off of the same infra that handles playing competitive games.
  // longterm we should be using specId as the parameter for starting a practice sesh.
  async play(gameId: string): Promise<void> {
    const userId = this.localUser.user$.value?.id;
    this.errors = [];

    if (!userId) {
      throw new Error("Can't start a practice challenge while not authenticated.");
    }

    this.isStartingSession = true;

    try {
      const player = await firstValueFrom(this.playerService.create({ userId: userId, gameId } as NewPlayer));
      this.playerContext = { playerId: player.id, userId: player.userId };
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isStartingSession = false;
  }

  protected handleDeployStatusChanged(isDeploying: boolean) {
    this.isDeploying = isDeploying;
  }

  protected handleStartNewChallengeClick(spec: SpecSummary) {
    const currentPracticeChallenge = this.activePracticeChallenge$.value;
    if (!currentPracticeChallenge) {
      throw new Error("Can't end previous challenge and start a new one - no previous challenge detected.");
    }

    this.modalService.openConfirm({
      title: `Start a new practice challenge?`,
      bodyContent: `If you continue, you'll end your session for practice challenge **${currentPracticeChallenge.spec.name}** and start a new one for this challenge (**${spec.name}**). Are you sure that's what you want to do?`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await firstValueFrom(this.teamService.endSession({ teamId: currentPracticeChallenge.teamId }));
        this.play(spec.gameId);
      }
    });
  }

  private handleActiveChallengeAttemptsExhausted(challenge: LocalActiveChallenge) {
    this.handleChallengeFailed(challenge, "attempts");
  }

  private handleActiveChallengeExpired(challenge: LocalActiveChallenge) {
    this.handleChallengeFailed(challenge, "timeUp");
  }

  private handleActiveChallengeCompleted(challenge: LocalActiveChallenge) {
    this.modalService.openComponent({
      content: PracticeChallengeSolvedModalComponent,
      context: {
        context: {
          challenge
        }
      },
    });
  }

  private handleChallengeFailed(challenge: LocalActiveChallenge, reason: "attempts" | "timeUp") {
    const title = reason === "attempts" ? "Out of attempts!" : "Time's up";
    const reasonDescription = reason === "attempts" ?
      "you've used your alloted submissions for the challenge" :
      "you ran out of time";

    this.modalService.openConfirm({
      title,
      bodyContent: `Your session for challenge **${challenge.spec.name}** has ended because ${reasonDescription}. You can either start over and try again or head back to the Practice Area to find another challenge to try.`,
      renderBodyAsMarkdown: true,
      cancelButtonText: "Back to the Practice Area",
      confirmButtonText: "Try again",
      onCancel: () => this.routerService.toPracticeArea(),
      onConfirm: async () => {
        await this.routerService.toPracticeChallenge(challenge.spec);
        await this.play(challenge.game.id);
      },
    });
  }
}
