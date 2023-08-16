import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, forkJoin, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { PracticeModeCertificate, PracticeModeSettings, SearchPracticeChallengesResult } from '@/prac/practice.models';
import { LogService } from './log.service';
import { PlayerService } from '@/api/player.service';
import { activeChallengesStore } from '@/stores/active-challenges.store';
import { GameCardContext } from '@/api/game-models';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from '@/utility/config.service';

@Injectable({ providedIn: 'root' })
export class PracticeService {
  private _isEnabled$ = new BehaviorSubject<boolean | undefined>(undefined);
  public isEnabled$ = this._isEnabled$.pipe(map(isEnabled => !!isEnabled));

  constructor(
    private apiUrl: ApiUrlService,
    private configService: ConfigService,
    private domSanitizer: DomSanitizer,
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

    activeChallengesStore.update(state => {
      return {
        ...state,
        practice: []
      };
    });
  }

  async gamePlayerModeChanged(playerModeEvent: { gameId: string, isPractice: boolean }) {
    await this.updateIsEnabled();
  }

  getCertificateHtml(certificate: PracticeModeCertificate): Observable<string | null> {
    return forkJoin([
      this.http.get(`${this.configService.basehref}assets/templates/practice-certificate.template.html`, { responseType: 'text' }),
      this.http.get(this.apiUrl.build(`practice/certificate/${certificate.challenge.challengeSpecId}/html`), { responseType: "text" })
    ]).pipe(
      map(([templateHtml, bodyContent]) => ({ templateHtml, bodyContent })),
      map(ctx => {
        const templateSafe = ctx.templateHtml;
        const bodySafe = ctx.bodyContent;

        return templateSafe
          .toString()
          .replace("{{bodyContent}}", bodySafe?.toString())
          .replace("{{title}}", `Gameboard Practice Certificate | ${certificate.challenge.name}`);
      })
    );
  }

  getCertificates(): Observable<PracticeModeCertificate[]> {
    return this.http.get<PracticeModeCertificate[]>(this.apiUrl.build("practice/certificates"));
  }

  getCertificateTemplate(): Observable<string> {
    return this.http.get(`${this.configService.basehref}/assets/templates/practice-certificate.template.html`, { responseType: "text" });
  }

  getSettings(): Observable<PracticeModeSettings> {
    return this.http.get<PracticeModeSettings>(this.apiUrl.build("practice/settings"));
  }

  async isEnabled(): Promise<boolean> {
    if (this._isEnabled$.value === undefined) {
      await this.updateIsEnabled();
    }

    return this._isEnabled$.value!;
  }

  listGames(): Observable<GameCardContext[]> {
    return this.http.get<GameCardContext[]>(this.apiUrl.build('/practice/games'));
  }

  public searchChallenges(filter: any): Observable<SearchPracticeChallengesResult> {
    return this.http.get<SearchPracticeChallengesResult>(this.apiUrl.build('/practice', filter));
  }

  private async updateIsEnabled() {
    const isEnabled = await firstValueFrom(this.gameService.list({}).pipe(map(games => games.some(g => g.playerMode == PlayerMode.practice))));
    this.logService.logInfo("Practice service queried the API for the presence of practice games: ", isEnabled);
    this._isEnabled$.next(isEnabled);
  }

  public async updateSettings(settings: PracticeModeSettings) {
    this.logService.logInfo("Updating settings", settings);
    return await firstValueFrom(this.http.put(this.apiUrl.build("/practice/settings"), settings));
  }
}
