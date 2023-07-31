import { UserChallengeSlim } from '@/api/board-models';
import { PlayerMode } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { UserService } from '@/api/user.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { LogService } from '@/services/log.service';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject, combineLatest, firstValueFrom, map, of, timer } from 'rxjs';

@Component({
  selector: 'app-practice-challenge-state-summary',
  templateUrl: './practice-challenge-state-summary.component.html',
  styleUrls: ['./practice-challenge-state-summary.component.scss']
})
export class PracticeChallengeStateSummaryComponent implements OnChanges {
  @Input() userId?: string;

  protected msElapsed$?: Observable<number | undefined>;
  protected msRemaining$?: Observable<number | undefined>;
  protected userActivePracticeChallenge: UserChallengeSlim | undefined | null;

  private _timer$ = timer(0, 1000);

  constructor(
    protected faService: FontAwesomeService,
    private logService: LogService,
    private playerService: PlayerService,
    private routerService: RouterService,
    private practiceService: PracticeService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes.userId)
      return;

    this.updatePracticeChallenge();
  }

  private async updatePracticeChallenge() {
    this.userActivePracticeChallenge = undefined;
    if (!this.userId)
      this.userActivePracticeChallenge = null;

    this.userActivePracticeChallenge = await firstValueFrom(this.practiceService.getActivePracticeChallenge(this.userId!));
    this.updateTimes();
  }

  private updateTimes() {
    if (this.userActivePracticeChallenge) {
      // rely on the server's concept of "now" to avoid timezone issues
      this.msElapsed$ = this._timer$.pipe(map(tick => (this.userActivePracticeChallenge!.session.now.getTime() - this.userActivePracticeChallenge!.session.start.getTime() || 0) + tick * 1000));
      this.msRemaining$ = this._timer$.pipe(map(tick => Math.max(this.userActivePracticeChallenge?.session.msTilEnd || 0) - tick * 1000, 0));
    }
    else {
      this.msElapsed$ = undefined;
      this.msRemaining$ = undefined;
    }
  }

  async extendSession(): Promise<void> {
    if (!this.userActivePracticeChallenge) {
      this.logService.logError("Can't extend a session without an active practice challenge.");
    }

    const teamId = this.userActivePracticeChallenge!.teamId;
    this.userActivePracticeChallenge = undefined;
    await firstValueFrom(this.playerService.updateSession({
      teamId,
      sessionEnd: new Date()
    }));
    await this.updatePracticeChallenge();
  }

  async endSession(): Promise<void> {
    if (!this.userActivePracticeChallenge) {
      this.logService.logError("Can't extend a session without an active practice challenge.");
    }

    await this.practiceService.endPracticeChallenge(this.userActivePracticeChallenge!.teamId);
    await this.updatePracticeChallenge();
  }
}
