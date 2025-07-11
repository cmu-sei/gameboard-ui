import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, firstValueFrom } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { NewPlayer, PlayerMode } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { fa } from "@/services/font-awesome.service";
import { PracticeService } from '@/services/practice.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { RouterService } from '@/services/router.service';
import { PracticeChallengeSolvedModalComponent } from '../practice-challenge-solved-modal/practice-challenge-solved-modal.component';
import { TeamService } from '@/api/team.service';
import { WindowService } from '@/services/window.service';
import { UserActiveChallenge } from '@/api/challenges.models';
import { PracticeChallengeView, PracticeSession } from '@/prac/practice.models';

@Component({
    selector: 'app-practice-session',
    templateUrl: './practice-session.component.html',
    styles: [
        ".container.miniplayer-available { max-width: 1440px }"
    ],
    providers: [UnsubscriberService],
    standalone: false
})
export class PracticeSessionComponent implements OnInit {
  protected windowWidth$ = this.windowService.resize$;
  spec$: Observable<PracticeChallengeView>;
  authed$: Observable<boolean>;

  protected errors: any = [];
  protected fa = fa;
  protected isMiniPlayerEnabled = false;
  protected isPlayingOtherChallenge = false;
  protected isStartingSession = false;
  protected practiceSession: PracticeSession | null = null;
  protected showSpecMarkdown = true;

  constructor(
    private activeChallengesRepo: ActiveChallengesRepo,
    private modalService: ModalConfirmService,
    private localUser: LocalUserService,
    private playerService: PlayerService,
    private practiceService: PracticeService,
    protected route: ActivatedRoute,
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
      switchMap(p => practiceService.searchChallenges({ filter: { term: p } })),
      map(r => !r.results.items.length ? ({ name: "Not Found" } as PracticeChallengeView) : r.results.items[0]),
    );

    this.unsub.add(this.activeChallengesRepo.challengeCompleted$.subscribe(c => this.handleActiveChallengeCompleted(c)));
    this.unsub.add(this.activeChallengesRepo.challengeExpired$.subscribe(c => this.handleActiveChallengeExpired(c)));
    this.unsub.add(this.teamService.teamSessionEndedManually$.subscribe(tId => this.handleTeamSessionEnded(tId)));

    this.unsub.add(
      combineLatest([this.activeChallengesRepo.activePracticeChallenge$, this.spec$]).pipe(map(thing => ({ activeChallenge: thing[0], currentSpec: thing[1] }))).subscribe(ctx => {
        this.isPlayingOtherChallenge = !!(ctx.activeChallenge && ctx.activeChallenge.spec.id !== ctx.currentSpec.id);

        // if we're actively playing the challenge on _this page_, we don't need to see
        // the spec markdown, because the Play component will display a more extensive
        // doc that may be transformed for the given challenge.
        this.showSpecMarkdown = !ctx.activeChallenge || ctx.activeChallenge.spec.id !== ctx.currentSpec.id;
      })
    );
  }

  async ngOnInit(): Promise<void> {
    this.practiceSession = await this.practiceService.getSession();
  }

  async play(spec: { id: string, game: { id: string } }): Promise<void> {
    if (this.practiceSession && this.practiceSession.gameId == spec.game.id)
      return;

    const userId = this.localUser.user$.value?.id;
    this.errors = [];

    if (!userId) {
      throw new Error("Can't start a practice challenge while not authenticated.");
    }

    this.isStartingSession = true;

    try {
      await firstValueFrom(this.playerService.create({ userId: userId, gameId: spec.game.id } as NewPlayer));
      this.practiceSession = await this.practiceService.getSession();
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isStartingSession = false;
  }

  protected handleStartNewChallengeClick(spec: PracticeChallengeView) {
    const currentPracticeChallenge = this.activeChallengesRepo.getActivePracticeChallenge();
    if (!currentPracticeChallenge) {
      throw new Error("Can't end previous challenge and start a new one - no previous challenge detected.");
    }

    this.modalService.openConfirm({
      title: `Start a new practice challenge?`,
      bodyContent: `If you continue, you'll end your session for practice challenge **${currentPracticeChallenge.spec.name}** and start a new one for this challenge (**${spec.name}**). Are you sure that's what you want to do?`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await this.teamService.endSession({ teamId: currentPracticeChallenge.team.id });
        this.play({ id: spec.id, game: { id: spec.game.id } });
      }
    });
  }

  private handleActiveChallengeExpired(challenge: UserActiveChallenge) {
    this.practiceSession = null;

    this.modalService.openConfirm({
      title: "Time's up",
      subtitle: "Practice Session",
      bodyContent: `Your session for challenge **${challenge.name}** has ended because you're out of time. You can either start over and try again or head back to the Practice Area to find another challenge to try.`,
      renderBodyAsMarkdown: true,
      cancelButtonText: "Back to the Practice Area",
      confirmButtonText: "Try again",
      onCancel: () => this.routerService.toPracticeArea(),
      onConfirm: async () => {
        await this.routerService.toPracticeChallenge(challenge.spec);
        await this.play({ id: challenge.spec.id, game: challenge.game });
      },
    });
  }

  private handleActiveChallengeCompleted(challenge: UserActiveChallenge) {
    if (challenge.mode !== PlayerMode.practice)
      return;

    this.practiceSession = null;

    this.modalService.openComponent({
      content: PracticeChallengeSolvedModalComponent,
      context: {
        context: {
          challenge
        }
      },
      modalClasses: ["modal-xl"]
    });
  }

  private handleTeamSessionEnded(teamId: string) {
    this.practiceSession = null;
  }
}
