import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, map, tap } from 'rxjs';
import { DateTime } from 'luxon';
import { Challenge, GameState, NewChallenge, SectionSubmission } from './board-models';
import { ApiUrlService } from '@/services/api-url.service';
import { ChallengeProgressResponse, ChallengeSolutionGuide, GetUserActiveChallengesResponse } from './challenges.models';

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private _challengeDeleted$ = new Subject<string>();
  public readonly challengeDeleted$ = this._challengeDeleted$.asObservable();

  private _challengeDeployStateChanged$ = new Subject<Challenge>();
  public readonly challengeDeployStateChanged$ = this._challengeDeployStateChanged$.asObservable();

  private _challengeStarted$ = new Subject<Challenge>();
  public readonly challengeStarted$ = this._challengeStarted$.asObservable();

  private _challengeGraded$ = new Subject<Challenge>();
  public readonly challengeGraded$ = this._challengeGraded$.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public async delete(challengeId: string) {
    await firstValueFrom(this.http.delete(this.apiUrl.build(`challenge/${challengeId}`)));
    this._challengeDeleted$.next(challengeId);
  }

  public getActiveChallenges(userId: string): Promise<GetUserActiveChallengesResponse> {
    return firstValueFrom(this.http.get<GetUserActiveChallengesResponse>(this.apiUrl.build(`/user/${userId}/challenges/active`)));
  }

  public retrieve(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(this.apiUrl.build(`challenge/${id}`));
  }

  public start(request: { teamId: string, challengeSpecId: string }): Promise<Challenge> {
    return firstValueFrom(this.http.post<Challenge>(this.apiUrl.build(`challenge`), request));
  }

  public startPlaying(challenge: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(this.apiUrl.build("challenge/launch"), challenge).pipe(
      tap(challenge => this._challengeStarted$.next(challenge))
    );
  }

  public sync(challengeId: string): Promise<GameState> {
    return firstValueFrom(this.http.put<GameState>(this.apiUrl.build(`challenge/${challengeId}/sync`), {}));
  }

  public deploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/start"), challenge).pipe(tap(challenge => {
      this._challengeDeployStateChanged$.next(challenge);
    }));
  }

  public undeploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/stop"), challenge).pipe(tap(challenge => {
      this._challengeDeployStateChanged$.next(challenge);
    }));
  }

  public grade(model: SectionSubmission): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/grade"), model).pipe(
      tap(challenge => this._challengeGraded$.next(challenge)),
    );
  }

  public regrade(id: string): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/regrade"), { id }).pipe(
      tap(challenge => this._challengeGraded$.next(challenge))
    );
  }

  public getSolutionGuide(challengeId: string): Observable<ChallengeSolutionGuide | null> {
    return this.http.get<ChallengeSolutionGuide>(this.apiUrl.build(`challenge/${challengeId}/solution-guide`));
  }

  public getProgress(challengeId: string): Promise<ChallengeProgressResponse> {
    return firstValueFrom(this.http.get<ChallengeProgressResponse>(this.apiUrl.build(`challenge/${challengeId}/progress`)).pipe(
      tap(response => {
        if (response && response.progress.lastScoreTime) {
          response.progress.lastScoreTime = DateTime.fromISO(response.progress.lastScoreTime.toString());
        }
      }),
    ));
  }
}
