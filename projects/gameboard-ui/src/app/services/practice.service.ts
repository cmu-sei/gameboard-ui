import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { SearchPracticeChallengesResult } from '@/prac/practice.models';

@Injectable({ providedIn: 'root' })
export class PracticeService {
  constructor(
    private apiUrl: ApiUrlService,
    private gameService: GameService,
    private http: HttpClient) { }

  isEnabled(): Promise<boolean> {
    return firstValueFrom(this.gameService.list({}).pipe(map(games => games.some(g => g.playerMode == PlayerMode.practice))));
  }

  public searchChallenges(filter: any): Observable<SearchPracticeChallengesResult> {
    return this.http.get<SearchPracticeChallengesResult>(this.apiUrl.build('/practice', filter));
  }
}
