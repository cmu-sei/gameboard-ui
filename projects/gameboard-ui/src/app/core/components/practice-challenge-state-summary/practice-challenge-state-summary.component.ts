import { LocalActiveChallenge } from '@/api/board-models';
import { PlayerService } from '@/api/player.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { LogService } from '@/services/log.service';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateTime, Duration } from 'luxon';
import { Observable, firstValueFrom, map, of, timer } from 'rxjs';

@Component({
  selector: 'app-practice-challenge-state-summary',
  templateUrl: './practice-challenge-state-summary.component.html',
  styleUrls: ['./practice-challenge-state-summary.component.scss']
})
export class PracticeChallengeStateSummaryComponent implements OnChanges {
  @Input() userId?: string;

  protected msElapsed$?: Observable<number | undefined>;
  protected msRemaining$?: Observable<number | undefined>;
  protected userActivePracticeChallenge: LocalActiveChallenge | undefined | null;

  private _timer$ = timer(0, 1000);

  constructor(
    protected faService: FontAwesomeService,
    private logService: LogService,
    private playerService: PlayerService,
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
    this.msElapsed$ = this._timer$.pipe(
      map(tick =>
        this.userActivePracticeChallenge?.session.start ?
          DateTime.now().diff(this.userActivePracticeChallenge.session.start).toMillis() :
          undefined
      )
    );

    this.msRemaining$ = this._timer$.pipe(
      map(tick =>
        this.userActivePracticeChallenge?.session.end ?
          this.userActivePracticeChallenge.session.end.diffNow().toMillis() : undefined
      )
    );
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
