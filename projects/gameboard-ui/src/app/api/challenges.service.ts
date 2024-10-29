import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, map, tap } from 'rxjs';
import { DateTime } from 'luxon';
import { Challenge, NewChallenge, SectionSubmission } from './board-models';
import { ApiUrlService } from '@/services/api-url.service';
import { ChallengeProgressResponse, ChallengeSolutionGuide, ChallengeSubmissionAnswers, ChallengeSubmissionHistory, GetChallengeSubmissionsResponseLegacy, GetUserActiveChallengesResponse } from './challenges.models';
import { groupBy } from '../../tools/tools';

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private _challengeDeployStateChanged$ = new Subject<Challenge>();
  public readonly challengeDeployStateChanged$ = this._challengeDeployStateChanged$.asObservable();

  private _challengeStarted$ = new Subject<Challenge>();
  public readonly challengeStarted$ = this._challengeStarted$.asObservable();

  private _challengeGraded$ = new Subject<Challenge>();
  public readonly challengeGraded$ = this._challengeGraded$.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public getActiveChallenges(userId: string): Promise<GetUserActiveChallengesResponse> {
    return firstValueFrom(this.http.get<GetUserActiveChallengesResponse>(this.apiUrl.build(`/user/${userId}/challenges/active`)));
  }

  public retrieve(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(this.apiUrl.build(`challenge/${id}`));
  }

  public startPlaying(challenge: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(this.apiUrl.build("challenge"), challenge).pipe(
      tap(challenge => this._challengeStarted$.next(challenge))
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

  public getSubmissionsLegacy(challengeId: string): Observable<GetChallengeSubmissionsResponseLegacy> {
    return this.http.get<GetChallengeSubmissionsResponseLegacy>(this.apiUrl.build(`challenge/${challengeId}/submissions`));
  }

  public async getSubmissions(challengeId: string): Promise<ChallengeSubmissionHistory> {
    const legacySubmissions = await firstValueFrom(this.getSubmissionsLegacy(challengeId));
    const submissionsBySection = groupBy(legacySubmissions.submittedAnswers, s => s.sectionIndex);
    const retVal: ChallengeSubmissionHistory = {
      challengeId: legacySubmissions.challengeId,
      teamId: legacySubmissions.teamId,
      sectionSubmissions: Array.from(submissionsBySection.keys()).reduce((dict, index) => {
        dict[index] = [];
        return dict;
      }, {})
    };

    for (const section of submissionsBySection) {
      for (const submission of section[1]) {
        retVal.sectionSubmissions[section[0]].push({
          answers: submission.answers,
          submittedAt: DateTime.fromISO(submission.submittedOn?.toString()).toMillis()
        });
      }
    }

    return retVal;
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

  public savePendingSubmission(challengeId: string, submission: ChallengeSubmissionAnswers) {
    return this.http.put(this.apiUrl.build(`challenge/${challengeId}/submissions/pending`), submission);
  }
}
