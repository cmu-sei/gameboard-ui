import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { PracticeModeSettings, PracticeSession, SearchPracticeChallengesResult, UserPracticeHistoryChallenge, UserPracticeSummary } from '@/prac/practice.models';
import { LogService } from './log.service';
import { GameCardContext } from '@/api/game-models';

@Injectable({ providedIn: 'root' })
export class PracticeService {
  private _isEnabled$ = new BehaviorSubject<boolean | undefined>(undefined);
  public isEnabled$ = this._isEnabled$.pipe(map(isEnabled => !!isEnabled));

  constructor(
    private apiUrl: ApiUrlService,
    private gameService: GameService,
    private http: HttpClient,
    private logService: LogService) {
  }

  async gamePlayerModeChanged(playerModeEvent: { gameId: string, isPractice: boolean }) {
    await this.updateIsEnabled();
  }

  async getSession(): Promise<PracticeSession | null> {
    return firstValueFrom(this.http.get<PracticeSession>(this.apiUrl.build("practice/session")).pipe(map(s => s || null)));
  }

  getSettings(): Observable<PracticeModeSettings> {
    return this.http.get<PracticeModeSettings>(this.apiUrl.build("practice/settings"));
  }

  async getUserPracticeHistory(userId: string) {
    return firstValueFrom(this.http.get<UserPracticeHistoryChallenge[]>(this.apiUrl.build(`practice/user/${userId}/history`)));
  }

  async getUserPracticeSummary(userId: string) {
    return firstValueFrom(this.http.get<UserPracticeSummary>(this.apiUrl.build(`practice/user/${userId}/summary`)));
  }

  async isEnabled(): Promise<boolean> {
    // lazily load the value for practice mode
    if (this._isEnabled$.value === undefined) {
      await this.updateIsEnabled();
    }

    return this._isEnabled$.value!;
  }

  public listGames(): Observable<GameCardContext[]> {
    return this.http.get<GameCardContext[]>(this.apiUrl.build('/practice/games'));
  }

  public searchChallenges(filter: any): Observable<SearchPracticeChallengesResult> {
    return this.http.get<SearchPracticeChallengesResult>(this.apiUrl.build('/practice', filter));
  }

  private async updateIsEnabled() {
    const hasPracticeGames = await firstValueFrom(this.gameService.list({}).pipe(map(games => games.some(g => g.playerMode == PlayerMode.practice))));
    this.logService.logInfo("Practice service queried the API for the presence of practice games: ", hasPracticeGames);

    const settings = await firstValueFrom(this.getSettings());
    this.logService.logInfo("Practice service checked for max concurrency limit", settings.maxConcurrentPracticeSessions);

    this._isEnabled$.next(hasPracticeGames && settings.maxConcurrentPracticeSessions !== 0);
  }

  public async updateSettings(settings: PracticeModeSettings) {
    this.logService.logInfo("Updating settings", settings);
    const result = await firstValueFrom(this.http.put(this.apiUrl.build("/practice/settings"), settings));
    await this.updateIsEnabled();
    return result;
  }
}
