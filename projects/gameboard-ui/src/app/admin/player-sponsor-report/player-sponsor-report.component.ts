// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, ViewChild } from '@angular/core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, NgForm } from '@angular/forms';
import { Search } from '../../api/models';
import { ReportService } from '../../api/report.service';
import { GameService } from '../../api/game.service';
import { GameSponsorReport, SponsorReport, SponsorStat } from '../../api/report-models';
import { Game } from '../../api/game-models';
import { SponsorService } from '../../api/sponsor.service';

@Component({
  selector: 'player-sponsor-user-report',
  templateUrl: './player-sponsor-report.component.html',
  styleUrls: ['./player-sponsor-report.component.scss']
})
export class PlayerSponsorReportComponent {
  @ViewChild(NgForm) form!: FormGroup;
  gameSponsorReport?: GameSponsorReport;
  sponsors?: SponsorReport;
  sponsorStats?: SponsorStat[];
  games?: Game[];
  search: Search = { term: '' };
  currentGame?: Game;

  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private gameService: GameService,
  ) {
    this.gameService.list(this.search).subscribe(
      r => {
        this.games = r;
        if (this.games.length > 0) {
          this.currentGame = this.games[0];

          this.api.gameSponsorReport(this.currentGame.id).subscribe(
            r => {
              this.gameSponsorReport = r;
            }
          );
        }
      }
    );

    this.api.sponsorReport().subscribe(
      r => {
        this.sponsors = r;
        this.sponsorStats = r.stats;
      }
    );
  }

  updateGame(id: string) {
    if (this.games) {
      this.currentGame = this.games.find(g => g.id == id);

      if (this.currentGame) {
        this.api.gameSponsorReport(this.currentGame.id).subscribe(
          r => {
            this.gameSponsorReport = r;
          }
        );
      }
    }
  }

  downloadGameSponsorReport(id: string) {
    this.api.exportGameSponsorReport(id);
  }

  downloadSponsorReport() {
    this.api.exportSponsorReport();
  }
}
