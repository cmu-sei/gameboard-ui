import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { SearchPracticeChallengesResult } from '@/prac/practice.models';
import { LogService } from './log.service';
import { UserChallengeSlim } from '@/api/board-models';
import { PlayerService } from '@/api/player.service';

@Injectable({ providedIn: 'root' })
export class PracticeService {
  private _isEnabled$ = new BehaviorSubject<boolean | undefined>(undefined);
  public isEnabled$ = this._isEnabled$.pipe(map(isEnabled => !!isEnabled));

  constructor(
    private apiUrl: ApiUrlService,
    private gameService: GameService,
    private http: HttpClient,
    private logService: LogService,
    private playerService: PlayerService) {
  }

  async endPracticeChallenge(teamId: string) {
    await firstValueFrom(this.playerService.updateSession({
      teamId,
      sessionEnd: new Date(Date.parse("0001-01-01T00:00:00Z"))
    }));
  }

  async gamePlayerModeChanged(playerModeEvent: { gameId: string, isPractice: boolean }) {
    await this.updateIsEnabled();
  }

  public getActivePracticeChallenge(userId: string): Observable<UserChallengeSlim | null> {
    return this.http.get<UserChallengeSlim[]>(this.apiUrl.build(`practice/user/${userId}/challenges/active`)).pipe(
      map(
        challenges => {
          challenges = challenges.map(c => {
            c.session.start = new Date(c.session.start);
            c.session.end = new Date(c.session.end);
            c.session.now = new Date(c.session.now);
            return c;
          });

          // for now, we're only allowing a single active practice challenge
          return challenges.length ? challenges[0] : null;
        }
      ),
    );
  }

  async isEnabled(): Promise<boolean> {
    if (this._isEnabled$.value === undefined) {
      await this.updateIsEnabled();
    }

    return this._isEnabled$.value!;
  }

  public searchChallenges(filter: any): Observable<SearchPracticeChallengesResult> {
    return this.http.get<SearchPracticeChallengesResult>(this.apiUrl.build('/practice', filter));
  }

  private async updateIsEnabled() {
    const isEnabled = await firstValueFrom(this.gameService.list({}).pipe(map(games => games.some(g => g.playerMode == PlayerMode.practice))));
    this.logService.logInfo("Practice service queried the API for the presence of practice games: ", isEnabled);
    this._isEnabled$.next(isEnabled);
  }
}
