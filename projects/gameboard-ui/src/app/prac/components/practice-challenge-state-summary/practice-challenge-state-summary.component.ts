import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { UserActiveChallenge } from '@/api/challenges.models';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { slug } from '@/../tools/functions';
import { TeamService } from '@/api/team.service';
import { ToastService } from '@/utility/services/toast.service';
import { UserSettingsService } from '@/services/user-settings.service';

@Component({
    selector: 'app-practice-challenge-state-summary',
    templateUrl: './practice-challenge-state-summary.component.html',
    styleUrls: ['./practice-challenge-state-summary.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class PracticeChallengeStateSummaryComponent {
  protected activeChallenge$: Observable<UserActiveChallenge | null>;
  protected msPerHour = 3600000;
  protected msRemaining$ = of(0);
  protected extendTooltip = "";
  protected isChangingSessionEnd = false;
  protected fa = fa;
  protected slug = slug;
  protected userSettings$ = this.userSettings.updated$;

  constructor(
    activeChallengesRepo: ActiveChallengesRepo,
    private teamService: TeamService,
    private toastService: ToastService,
    private userSettings: UserSettingsService) {
    this.activeChallenge$ = activeChallengesRepo.activePracticeChallenge$;
  }

  async extendSession(practiceChallenge: UserActiveChallenge): Promise<void> {
    this.isChangingSessionEnd = true;
    await this.teamService.extendSession({
      teamId: practiceChallenge.team.id,
      sessionEnd: new Date()
    });

    this.isChangingSessionEnd = false;
    this.showExtensionToast(DateTime.now().plus({ minutes: 60 }));
  }

  async endSession(practiceChallenge: UserActiveChallenge): Promise<void> {
    this.isChangingSessionEnd = true;
    await this.teamService.endSession({ teamId: practiceChallenge.team.id });
    this.isChangingSessionEnd = false;
  }

  protected handleToggleStickyPanel(enable: boolean) {
    this.userSettings.updated$.next({ useStickyChallengePanel: enable });
  }

  private showExtensionToast(sessionEnd: DateTime, isAutomatic = false) {
    const timeExpression = Math.floor(sessionEnd.diffNow().shiftTo('minutes').minutes);
    this.toastService.showMessage(`Your practice session has been ${isAutomatic ? "automatically " : ""}**extended** (now ends in **${timeExpression}** minutes).`);
  }
}
