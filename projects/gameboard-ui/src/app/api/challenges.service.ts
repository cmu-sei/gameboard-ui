import { Injectable } from '@angular/core';
import { Challenge, NewChallenge } from './board-models';
import { Observable } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChallengesService {

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public startPlaying(challenge: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(this.apiUrl.build("challenge"), challenge);
  }

  public deploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/start"), challenge);
  }

  public undeploy(challenge: { id: string }): Observable<Challenge> {
    return this.http.put<Challenge>(this.apiUrl.build("challenge/stop"), challenge);
  }
}
