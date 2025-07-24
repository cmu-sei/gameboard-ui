import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { CreatePracticeChallengeGroupRequest, PracticeChallengeGroupDto, ListChallengeGroupsResponse, ListChallengeGroupsResponseGroup, PracticeModeSettings, PracticeSession, SearchPracticeChallengesRequest, SearchPracticeChallengesResult, UpdateChallengeGroupRequest, UserPracticeSummary, GetPracticeChallengeGroupResponse, PracticeChallengeView, ListChallengesRequest, ChallengesAddToGroupRequest, ChallengesAddToGroupResponse, ChallengeTagsListResponse } from '@/prac/practice.models';
import { LogService } from './log.service';
import { toFormData } from '../../tools/object-tools.lib';

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

  public async challengeGroupCreate(request: CreatePracticeChallengeGroupRequest): Promise<PracticeChallengeGroupDto> {
    const asFormData = toFormData(request, "request");
    return await firstValueFrom(this.http.post<PracticeChallengeGroupDto>(this.apiUrl.build("practice/challenge-group"), asFormData));
  }

  public challengeGroupDelete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(this.apiUrl.build(`practice/challenge-group/${id}`)));
  }

  public async challengeGroupGet(id: string): Promise<GetPracticeChallengeGroupResponse> {
    return await firstValueFrom(this.http.get<GetPracticeChallengeGroupResponse>(this.apiUrl.build(`practice/challenge-group/${id}`)));
  }

  public async challengeGroupList(): Promise<ListChallengeGroupsResponseGroup[]> {
    const response = await firstValueFrom(this.http.get<ListChallengeGroupsResponse>(this.apiUrl.build("practice/challenge-group/list")));
    return response.groups;
  }

  public async challengeGroupUpdate(request: UpdateChallengeGroupRequest): Promise<PracticeChallengeGroupDto> {
    const asFormData = toFormData(request, "request");
    return await firstValueFrom(this.http.put<PracticeChallengeGroupDto>(this.apiUrl.build("practice/challenge-group"), asFormData));
  }

  public async challengesAddToGroup(challengeGroupId: string, request: ChallengesAddToGroupRequest): Promise<ChallengesAddToGroupResponse> {
    return await firstValueFrom(this.http.post<ChallengesAddToGroupResponse>(this.apiUrl.build(`practice/challenge-group/${challengeGroupId}/challenges`), request));
  }

  public async challengesRemoveFromGroup(request: { challengeGroupId: string, challengeSpecIds: string[] }): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(this.apiUrl.build(`practice/challenge-group/${request.challengeGroupId}/challenges`), { body: { challengeSpecIds: request.challengeSpecIds } }));
  }

  public challengesList(request?: ListChallengesRequest): Promise<PracticeChallengeView[]> {
    return firstValueFrom(this.http.get<PracticeChallengeView[]>(this.apiUrl.build("practice/challenge/list", request)));
  }

  public challengeTagsList(): Promise<ChallengeTagsListResponse> {
    return firstValueFrom(this.http.get<ChallengeTagsListResponse>(this.apiUrl.build("practice/challenge-tags")));
  }

  public searchChallenges(request?: SearchPracticeChallengesRequest): Observable<SearchPracticeChallengesResult> {
    return this.http.get<SearchPracticeChallengesResult>(this.apiUrl.build('/practice', { ...request?.filter, userProgress: request?.userProgress }));
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
