import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import { Challenge, NewChallenge } from './board-models';
import { ApiUrlService } from '@/services/api-url.service';
import { activeChallengesStore } from '@/stores/active-challenges.store';
import { ActiveChallenge, UserActiveChallenges, UserApiActiveChallenges } from './challenges.models';
import { LocalTimeWindow } from '@/core/models/api-time-window';
import { PlayerMode } from './player-models';
import { SimpleEntity } from './models';

@Injectable({ providedIn: 'root' })
export class ChallengesService {
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

  public startPlaying(challenge: NewChallenge): Observable<ActiveChallenge> {
    const specId = challenge.specId;
    return this.http.post<Challenge>(this.apiUrl.build("challenge"), challenge).pipe(
      switchMap(c => this.getActiveChallenges(challenge.userId)),
      map(activeChallenges => {
        const startedChallenge = [...activeChallenges.competition, ...activeChallenges.practice].find(c => c.spec.id === specId);

        if (!startedChallenge)
          throw new Error(`Couldn't resolve the started challenge with specId ${specId}.`);

        return startedChallenge;
      })
    )
  }

  public deploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/start"), challenge);
  }

  public undeploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/stop"), challenge);
  }
}
