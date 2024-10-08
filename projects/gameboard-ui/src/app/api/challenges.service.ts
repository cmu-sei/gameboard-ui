import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, switchMap, tap } from 'rxjs';
import { Challenge, NewChallenge, SectionSubmission } from './board-models';
import { ApiUrlService } from '@/services/api-url.service';
import { activeChallengesStore } from '@/stores/active-challenges.store';
import { ChallengeSolutionGuide, ChallengeSubmissionAnswers, GetChallengeSubmissionsResponse, LocalActiveChallenge, UserActiveChallenges, UserApiActiveChallenges } from './challenges.models';
import { LocalTimeWindow } from '@/core/models/api-time-window';
import { PlayerMode } from './player-models';

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private _challengeDeployStateChanged$ = new Subject<Challenge>();
  public readonly challengeDeployStateChanged$ = this._challengeDeployStateChanged$.asObservable();

  private _challengeGraded$ = new Subject<Challenge>();
  public readonly challengeGraded$ = this._challengeGraded$.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public getActiveChallenges(userId: string): Observable<UserActiveChallenges> {
    return this.http.get<UserApiActiveChallenges>(this.apiUrl.build(`/user/${userId}/challenges/active`)).pipe(
      map(
        // the challenges come in with an API-level time-window (with epoch times for session)
        // we have to map them to localized time windows
        userActiveChallenges => {
          const mappedChallenges = [
            ...userActiveChallenges.competition || [],
            ...userActiveChallenges.practice || []
          ].map(c => ({
            ...c,
            session: new LocalTimeWindow(c.session)
          }));

          // update the store
          activeChallengesStore.update(state => ({
            user: userActiveChallenges.user,
            competition: mappedChallenges.filter(c => c.playerMode == PlayerMode.competition),
            practice: mappedChallenges.filter(c => c.playerMode == PlayerMode.practice)
          }));

          return activeChallengesStore.getValue();
        }
      ),
    );
  }

  public retrieve(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(this.apiUrl.build(`}/challenge/${id}`));
  }

  public startPlaying(challenge: NewChallenge): Observable<LocalActiveChallenge> {
    const specId = challenge.specId;
    return this.http.post<Challenge>(this.apiUrl.build("challenge"), challenge).pipe(
      switchMap(c => this.getActiveChallenges(challenge.userId)),
      map(activeChallenges => {
        const startedChallenge = [...activeChallenges.competition, ...activeChallenges.practice].find(c => c.spec.id === specId);
        if (!startedChallenge)
          throw new Error(`Couldn't resolve the started challenge with specId ${specId}.`);

        return startedChallenge;
      })
    );
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

  public getSubmissions(challengeId: string): Observable<GetChallengeSubmissionsResponse> {
    return this.http.get<GetChallengeSubmissionsResponse>(this.apiUrl.build(`challenge/${challengeId}/submissions`));
  }

  public savePendingSubmission(challengeId: string, submission: ChallengeSubmissionAnswers) {
    return this.http.put(this.apiUrl.build(`challenge/${challengeId}/submissions/pending`), submission);
  }
}
