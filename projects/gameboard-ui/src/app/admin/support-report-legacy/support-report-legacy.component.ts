// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ReportService } from '../../api/report.service';
import { TicketChallengeGroup, TicketDayGroup, TicketDayReport, TicketLabelGroup } from '../../api/support-models';
import { fa } from '@/services/font-awesome.service';

@Component({
    selector: 'app-support-report-legacy',
    templateUrl: './support-report-legacy.component.html',
    styleUrls: ['./support-report-legacy.component.scss'],
    standalone: false
})
export class SupportReportLegacyComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);

  showDays: boolean = true;
  showCategories: boolean = true;

  protected fa = fa;
  games?: Game[];
  currentGame?: Game;
  startRange?: Date;
  endRange?: Date;
  search: any = {};

  dayStats$: Observable<TicketDayReport>;
  labelStats$: Observable<TicketLabelGroup[]>;
  challengeStats$: Observable<TicketChallengeGroup[]>;

  constructor(
    private gameService: GameService,
    private api: ReportService,
  ) {

    this.gameService.list({}).subscribe(
      (games: Game[]) => {
        this.games = games;
      }
    );

    this.dayStats$ = this.refresh$.pipe(
      switchMap(() => this.api.supportDays(this.search))
    );
    this.labelStats$ = this.refresh$.pipe(
      switchMap(() => this.api.supportLabels(this.search))
    );
    this.challengeStats$ = this.refresh$.pipe(
      switchMap(() => this.api.supportChallenges(this.search))
    );
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

  downloadTicketDetailReport() {
    this.api.exportTicketDetails(this.search);
  }

  downloadTicketDayStatsReport() {
    this.api.exportTicketDayStats(this.search);
  }

  downloadTicketLabelStatsReport() {
    this.api.exportTicketLabelStats(this.search);
  }

  downloadTicketChallengeStatsReport() {
    this.api.exportTicketChallengeStats(this.search);
  }
}
