import { LocalActiveChallenge } from '@/api/challenges.models';
import { fa } from '@/services/font-awesome.service';
import { LogService } from '@/services/log.service';
import { PracticeService } from '@/services/practice.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, combineLatest, filter, firstValueFrom, map, timer } from 'rxjs';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { slug } from '@/tools/functions';
import { TeamService } from '@/api/team.service';

@Component({
  selector: 'app-practice-challenge-state-summary',
  templateUrl: './practice-challenge-state-summary.component.html',
  styleUrls: ['./practice-challenge-state-summary.component.scss']
})
export class PracticeChallengeStateSummaryComponent {
  protected isChangingSessionEnd = false;
  protected msElapsed$?: Observable<number | undefined>;
  protected msRemaining$?: Observable<number | undefined>;
  protected userActivePracticeChallenge: LocalActiveChallenge | undefined | null;
  protected fa = fa;
  protected slug = slug;
  private _timer$ = timer(0, 1000);

  constructor(
    activeChallengesRepo: ActiveChallengesRepo,
    localUserService: LocalUserService,
    private logService: LogService,
    private practiceService: PracticeService,
    private teamService: TeamService,
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

    // update timers to accurately reflect the active challenge
    this.msElapsed$ = this._timer$.pipe(
      map(tick =>
        this.userActivePracticeChallenge?.session.start ?
          DateTime.now().diff(this.userActivePracticeChallenge.session.start).toMillis() :
          undefined
      )
    );

    this.msRemaining$ = this._timer$.pipe(
      map(tick => this.userActivePracticeChallenge?.session.end ? this.userActivePracticeChallenge.session.end.diffNow().toMillis() : undefined)
    );
  }

  async extendSession(practiceChallenge: LocalActiveChallenge): Promise<void> {
    this.isChangingSessionEnd = true;
    const teamId = practiceChallenge.teamId;
    this.userActivePracticeChallenge = undefined;
    await firstValueFrom(this.teamService.extendSession({
      teamId,
      sessionEnd: new Date()
    }));
    this.isChangingSessionEnd = false;
  }

  async endSession(practiceChallenge: LocalActiveChallenge): Promise<void> {
    if (!this.userActivePracticeChallenge) {
      this.logService.logError("Can't extend a session without an active practice challenge.");
    }

    this.isChangingSessionEnd = true;
    await firstValueFrom(this.teamService.endSession({ teamId: this.userActivePracticeChallenge!.teamId }));
    this.isChangingSessionEnd = false;
  }
}
