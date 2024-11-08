import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { ChallengeSolutionGuide, UserActiveChallenge } from '@/api/challenges.models';
import { PlayerMode } from '@/api/player-models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { SpecSummary } from '@/api/spec-models';
import { WindowService } from '@/services/window.service';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';
import { CommonModule } from '@angular/common';
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
    VmLinkComponent
  ],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
  providers: [UnsubscriberService]
})
export class PlayComponent implements OnChanges {
  @Input() autoPlay = false;
  @Input() challengeSpec: SpecSummary | null = null;
  @Input() playerId?: string;
  @Output() challengeStarted = new EventEmitter<void>();
  @Output() deployStatusChanged = new EventEmitter<boolean>();

  protected challenge: UserActiveChallenge | null = null;
  protected errors: any[] = [];
  protected fa = fa;
  protected isDeploying = false;
  protected isMiniPlayerAvailable = false;
  protected isMiniPlayerSelected = false;
  protected isUndeploying = false;
  protected showMiniPlayerPrompt = false;
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
    this.windowWidth$ = windowService.resize$;
    this.unsub.add(
      windowService.resize$.subscribe(width => {
        this.isMiniPlayerAvailable = width >= 1140;
        this.isMiniPlayerSelected = this.localStorage.get(StorageKey.UsePlayPane) === "true";
        this.showMiniPlayerPrompt = this.localStorage.get(StorageKey.UsePlayPane) === null;

        if (!this.isMiniPlayerAvailable && this.isMiniPlayerSelected)
          this.setIsStickyPanelEnabled(this.isMiniPlayerSelected, false);
      }),

      userAppSettings.updated$.subscribe(settings => this.setIsStickyPanelEnabled(settings.useStickyChallengePanel, false))
    );
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (!(changes.autoPlay || changes.challengeSpec || changes.teamId))
      return;

    if (this.autoPlay && this.playerId && this.challengeSpec && this.challengeSpec.id !== changes.challengeSpec?.currentValue) {
      await this.deployChallenge({ challengeSpecId: changes.challengeSpec.currentValue.id, playerId: this.playerId });
    }
  }

  protected async deployVms(challengeId: string) {
    if (!challengeId) {
      throw new Error("Can't deploy from the Play component without a challenge.");
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

  protected setIsStickyPanelEnabled(isEnabled: boolean, notify = true) {
    this.showMiniPlayerPrompt = false;

    if (this.isMiniPlayerAvailable) {
      this.isMiniPlayerSelected = isEnabled;
      this.localStorage.add(StorageKey.UsePlayPane, this.isMiniPlayerSelected);

    }
    else {
      this.isMiniPlayerSelected = false;
      this.localStorage.add(StorageKey.UsePlayPane, false);
    }

    if (notify) {
      this.userAppSettings.updated$.next({ useStickyChallengePanel: this.isMiniPlayerSelected });
    }

    if (!this.isMiniPlayerSelected) {
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

  private async deployChallenge(args: { challengeSpecId: string, playerId: string }) {
    if (!this.localUser.user$.value) {
      throw new Error("Can't deploy for an unauthed user.");
    }

    this.errors = [];
    this.solutionGuide = null;

    this.deployStatusChanged.emit(true);
    this.isDeploying = true;

    try {
      const startedChallenge = await firstValueFrom(this.challengesService.startPlaying({
        specId: args.challengeSpecId,
        playerId: args.playerId,
        userId: this.localUser.user$.value.id
      }));

      this.challenge = this.activeChallengesRepo.getActivePracticeChallenge();
      this.vmUrls = this.buildVmLinks(this.challenge);

      // also look up the solution guide if there is one
      this.solutionGuide = await firstValueFrom(this.challengesService.getSolutionGuide(startedChallenge.id));
    }
    catch (err: any) {
      this.errors.push(err);
    }

    this.isDeploying = false;
    this.deployStatusChanged.emit(false);
  }
}
