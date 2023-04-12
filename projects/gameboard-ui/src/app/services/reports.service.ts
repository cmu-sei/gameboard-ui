import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report, ReportParameterOptions, ReportParameterType } from '../reports/reports-models';
import { BoardService } from "../api/board.service";
import { ConfigService } from '../utility/config.service';
import { SimpleEntity } from '../api/models';
import { GameService } from '../api/game.service';
import { PlayerService } from '../api/player.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private API_ROOT = '';

  constructor(
    private http: HttpClient,
    private boardService: BoardService,
    private gameService: GameService,
    private playerService: PlayerService,
    config: ConfigService
  ) {
    this.API_ROOT = `${config.apphost}api`;
  }

  list(): Observable<Report[]> {
    return of([
      {
        id: "dd2a257f-1bbc-4f33-bf07-a6ae36bfad37",
        name: "Participation Report",
        key: "participation-report",
        description: "See how users engaged in the competition over time, with views for the user, player, and team levels.",
        parameters: [
          {
            id: "2e09c74b-c05c-4ce8-ad2b-d4930bec6b67",
            name: "Date range",
            type: ReportParameterType.DateRange
          },
          {
            id: "9ad751c9-a1fb-4bc5-b6a5-395d53db0812",
            name: "Sponsor",
            type: ReportParameterType.Sponsor
          },
          {
            id: "1f4ce7d0-5808-49b6-992a-d442d8158a57",
            name: "Team",
            type: ReportParameterType.Team
          },
          {
            id: "6790b657-5e4f-47d2-958a-42d8f536d558",
            name: "Game",
            type: ReportParameterType.Game
          },
          {
            id: "abff2b3f-cb40-471b-8b8e-a33c0832ef33",
            name: "Challenge",
            type: ReportParameterType.Challenge
          }
        ]
      }
    ]);
  }

  get(key: string): Observable<Report | undefined> {
    return this.list()
      .pipe(map(reports => reports.find(r => r.key === key)));
  }

  getParameterOptions(reportKey: string): Observable<ReportParameterOptions> {
    return forkJoin({
      challenges: this.boardService
        .list()
        .pipe(
          map(challenges => challenges.map(c => ({ id: c.id, name: c.name } as SimpleEntity)))
        ),
      competitions: this.http.get<string[]>(`${this.API_ROOT}/report/parameter/competitions`),
      games: this.gameService
        .list()
        .pipe(
          map(games => games.map(g => ({ id: g.id, name: g.name } as SimpleEntity)))
        ),
      players: of([]),
      sponsors: of([]),
      teams: of([]),
      tracks: this.http.get<string[]>(`${this.API_ROOT}/report/parameter/tracks`)
    });
  }
}
