import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ReportService } from '../../api/report.service';
import { TicketChallengeGroup, TicketDayGroup, TicketLabelGroup } from '../../api/support-models';

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styleUrls: ['./support-report.component.scss']
})
export class SupportReportComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);

  showDays: boolean = true;
  showCategories: boolean = true;

  games?: Game[];
  currentGame?: Game;
  startRange?: Date;
  endRange?: Date;
  search: any = {};

  dayStats$: Observable<TicketDayGroup[]>;
  labelStats$: Observable<TicketLabelGroup[]>;
  challengeStats$: Observable<TicketChallengeGroup[]>;

  faArrowLeft = faArrowLeft;
  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;

  constructor(
    private gameService: GameService,
    private reportService: ReportService,
  ) { 

    this.gameService.list({}).subscribe(
      (games: Game[]) => {
        this.games = games;
      }
    );

    this.dayStats$ = this.refresh$.pipe(
      switchMap(() => this.reportService.supportDays(this.search))
    )
    this.labelStats$ = this.refresh$.pipe(
      switchMap(() => this.reportService.supportLabels(this.search))
    )
    this.challengeStats$ = this.refresh$.pipe(
      switchMap(() => this.reportService.supportChallenges(this.search))
    )
  
  }

  ngOnInit(): void {
  }

  updateGame(id: string) {
    if (this.games) {
      this.currentGame = this.games?.find(g => g.id === id);
    }
    this.updateSearch();
  }

  updateSearch() {
    this.search = {};
    if (this.startRange)
      this.search.startRange = this.startRange;
    if (this.endRange)
      this.search.endRange = this.endRange;
    if (this.currentGame)
      this.search.gameId = this.currentGame.id;
    this.refresh$.next(true);
  }

}
