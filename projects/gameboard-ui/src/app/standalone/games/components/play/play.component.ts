import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { ChallengeSolutionGuide, UserActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { WindowService } from '@/services/window.service';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { CoreModule } from '@/core/core.module';
import { ToSupportCodePipe } from '@/standalone/core/pipes/to-support-code.pipe';
import { ChallengeQuestionsComponent } from "../challenge-questions/challenge-questions.component";
import { UtilityModule } from '@/utility/utility.module';
import { ChallengeDeployCountdownComponent } from '@/game/components/challenge-deploy-countdown/challenge-deploy-countdown.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { VmLinkComponent } from "../vm-link/vm-link.component";
import { UserService } from '@/utility/user.service';
import { UserSettingsService } from '@/services/user-settings.service';
import { PracticeChallengeView } from '@/prac/practice.models';
import { FeedbackSubmissionFormComponent } from "@/feedback/components/feedback-submission-form/feedback-submission-form.component";

export type PlayChallengeDeployState = "deployed" | "deploying" | "undeploying" | "undeployed";

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    ChallengeDeployCountdownComponent,
    ErrorDivComponent,
    SpinnerComponent,
    ToSupportCodePipe,
    ChallengeQuestionsComponent,
    UtilityModule,
    VmLinkComponent,
    FeedbackSubmissionFormComponent
  ],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  providers: [UnsubscriberService]
})
export class PlayComponent implements OnChanges {
  @Input() autoPlay = false;
  @Input() challengeSpec: PracticeChallengeView | null = null;
  @Input() playerId?: string;
  @Output() challengeStarted = new EventEmitter<void>();
  @Output() deployStateChange = new EventEmitter<PlayChallengeDeployState>();

  protected challenge: UserActiveChallenge | null = null;
  protected deployState$ = new BehaviorSubject<PlayChallengeDeployState>("undeployed");
  protected errors: any[] = [];
  protected fa = fa;
  protected feedbackTemplateId$: Observable<string | null> = of(null);
  protected isStickyChallengePanelAvailable = false;
  protected isStickyChallengePanelSelected = false;
  protected showStickyChallengePanelPrompt = false;
  protected solutionGuide: ChallengeSolutionGuide | null = null;
  protected vmUrls: { [id: string]: string } = {};
  protected windowWidth$: Observable<number>;

  constructor(
    private activeChallengesRepo: ActiveChallengesRepo,
    private challengesService: ChallengesService,
    private localStorage: LocalStorageService,
    private localUser: UserService,
    private routerService: RouterService,
    private unsub: UnsubscriberService,
    private userAppSettings: UserSettingsService,
    private windowService: WindowService) {
    // wire up observables
    this.windowWidth$ = windowService.resize$;

    // and subs
    this.unsub.add(
      windowService.resize$.subscribe(width => {
        this.isStickyChallengePanelAvailable = width >= 1140;
        this.isStickyChallengePanelSelected = this.localStorage.get(StorageKey.UseStickyChallengePanel) === "true";
        this.showStickyChallengePanelPrompt = this.localStorage.get(StorageKey.UseStickyChallengePanel) === null;

        if (!this.isStickyChallengePanelAvailable && this.isStickyChallengePanelSelected)
          this.setIsStickyPanelEnabled(this.isStickyChallengePanelSelected, false);
      }),

      userAppSettings.updated$.subscribe(settings => this.setIsStickyPanelEnabled(settings.useStickyChallengePanel, false)),
      this.deployState$.subscribe(state => {
        this.deployStateChange.emit(state);
        this.challenge = this.activeChallengesRepo.getActivePracticeChallenge();
        this.vmUrls = this.buildVmLinks(this.challenge);
      })
    );
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (!(changes.autoPlay || changes.challengeSpec))
      return;

    if (this.autoPlay && this.playerId && this.challengeSpec && this.challengeSpec.id !== changes.challengeSpec?.currentValue) {
      await this.startChallenge({ challengeSpecId: changes.challengeSpec.currentValue.id, playerId: this.playerId });
    }
  }

  protected async deployVms(challengeId: string) {
    if (!challengeId) {
      throw new Error("Can't deploy from the Play component without a challenge.");
    }

    this.deployState$.next("deploying");
    await firstValueFrom(this.challengesService.deploy({ id: challengeId }));
    this.deployState$.next("deployed");
  }

  protected async undeployVms(challengeId: string) {
    this.deployState$.next("undeploying");
    await firstValueFrom(this.challengesService.undeploy({ id: challengeId }));
    this.deployState$.next("undeployed");
  }

  protected setIsStickyPanelEnabled(isEnabled: boolean, notify = true) {
    this.showStickyChallengePanelPrompt = false;

    if (this.isStickyChallengePanelAvailable) {
      this.isStickyChallengePanelSelected = isEnabled;
      this.localStorage.add(StorageKey.UseStickyChallengePanel, this.isStickyChallengePanelSelected);
    }
    else {
      this.isStickyChallengePanelSelected = false;
      this.localStorage.add(StorageKey.UseStickyChallengePanel, false);
    }

    if (notify) {
      this.userAppSettings.updated$.next({ useStickyChallengePanel: this.isStickyChallengePanelSelected });
    }

    if (!this.isStickyChallengePanelSelected) {
      this.windowService.scrollToBottom();
    }
  }

  private buildVmLinks(challenge: UserActiveChallenge | null) {
    const vmUrls: { [id: string]: string } = {};

    if (!challenge)
      return vmUrls;

    for (const vm of challenge.vms) {
      vmUrls[vm.id] = this.routerService.buildVmConsoleUrl(challenge.id, vm, challenge.mode === PlayerMode.practice);
    }

    return vmUrls;
  }

  private async startChallenge(args: { challengeSpecId: string, playerId: string }) {
    if (!this.localUser.user$.value) {
      throw new Error("Can't deploy for an unauthed user.");
    }

    this.errors = [];
    this.solutionGuide = null;
    this.deployState$.next("deploying");

    try {
      const startedChallenge = await firstValueFrom(this.challengesService.startPlaying({
        specId: args.challengeSpecId,
        playerId: args.playerId,
        userId: this.localUser.user$.value.id
      }));

      this.deployState$.next(startedChallenge.hasDeployedGamespace ? "deployed" : "undeployed");

      // also look up the solution guide if there is one
      this.solutionGuide = await firstValueFrom(this.challengesService.getSolutionGuide(startedChallenge.id));
    }
    catch (err: any) {
      this.errors.push(err);
      this.deployState$.next("undeployed");
    }
  }
}
