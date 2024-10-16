import { LocalActiveChallenge } from '@/api/challenges.models';
import { fa } from '@/services/font-awesome.service';
import { LogService } from '@/services/log.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, combineLatest, map, tap, timer } from 'rxjs';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { slug } from '@/../tools/functions';
import { TeamService } from '@/api/team.service';
import { ToastService } from '@/utility/services/toast.service';
import { NotificationService } from '@/services/notification.service';

@Component({
  selector: 'app-practice-challenge-state-summary',
  templateUrl: './practice-challenge-state-summary.component.html',
  styleUrls: ['./practice-challenge-state-summary.component.scss'],
  providers: [UnsubscriberService]
})
export class PracticeChallengeStateSummaryComponent {
  protected extendTooltip = "";
  protected isChangingSessionEnd = false;
  protected msElapsed$?: Observable<number | undefined>;
  protected msRemaining$?: Observable<number | undefined>;
  protected msInAnHour = 3600000;
  protected userActivePracticeChallenge: LocalActiveChallenge | undefined | null;
  protected fa = fa;
  protected slug = slug;
  private _timer$ = timer(0, 1000);

  constructor(
    activeChallengesRepo: ActiveChallengesRepo,
    localUserService: LocalUserService,
    private logService: LogService,
    private notificationService: NotificationService,
    private teamService: TeamService,
    private toastService: ToastService,
    // have to keep "unsub" around so it gets ngDestroyed. 
    // this is an argument for an inherited base class, i think
    private unsub: UnsubscriberService) {
    unsub.add(
      combineLatest([
        localUserService.user$,
        activeChallengesRepo.activePracticeChallenge$
      ]).pipe(
        map(([localUser, practiceChallenge]) => ({
          localUser,
          practiceChallenge
        })),
      ).subscribe(ctx => {
        this.updatePracticeChallenge(ctx.practiceChallenge);
        this.isChangingSessionEnd = false;
      })
    );
  }

  private async updatePracticeChallenge(challenge: LocalActiveChallenge | null) {
    // store the active challenge
    this.userActivePracticeChallenge = challenge || null;

    if (challenge?.teamId) {
      await this.notificationService.init(challenge.teamId);
      this.logService.logInfo("Practice challenge notification hub: connected to hub", challenge);
    }

    // update timers to accurately reflect the active challenge
    this.msElapsed$ = this._timer$.pipe(
      map(() =>
        this.userActivePracticeChallenge?.session.start ?
          DateTime.now().diff(this.userActivePracticeChallenge.session.start).toMillis() :
          undefined
      )
    );

    this.msRemaining$ = this._timer$.pipe(
      map(() => this.userActivePracticeChallenge?.session.end ? this.userActivePracticeChallenge.session.end.diffNow().toMillis() : 0),
      tap(msRemaining => this.extendTooltip = this.getExtendTooltip(msRemaining))
    );
  }

  async extendSession(practiceChallenge: LocalActiveChallenge): Promise<void> {
    this.isChangingSessionEnd = true;
    const teamId = practiceChallenge.teamId;
    await this.teamService.extendSession({
      teamId,
      sessionEnd: new Date()
    });

    this.isChangingSessionEnd = false;
    this.showExtensionToast(DateTime.now().plus({ minutes: 60 }));
  }

  async endSession(practiceChallenge: LocalActiveChallenge): Promise<void> {
    if (!this.userActivePracticeChallenge) {
      this.logService.logError("Can't extend a session without an active practice challenge.");
    }

    this.isChangingSessionEnd = true;
    await this.teamService.endSession({ teamId: this.userActivePracticeChallenge!.teamId });
    this.isChangingSessionEnd = false;
  }

  private getExtendTooltip(msRemaining: number) {
    if (msRemaining < this.msInAnHour) {
      return "If you want more time to practice, you can extend your session. Sessions extend to a maximum remaining time of 60 minutes.";
    }

    return "You can't extend your practice session because you have more than 60 minutes remaining.";
  }

  private showExtensionToast(sessionEnd: DateTime, isAutomatic = false) {
    const timeExpression = Math.floor(sessionEnd.diffNow().shiftTo('minutes').minutes);
    this.toastService.showMessage(`Your practice session has been ${isAutomatic ? "automatically " : ""}**extended** (now ends in **${timeExpression}** minutes).`);
  }
}
