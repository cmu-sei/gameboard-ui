// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ReportService } from '../../api/report.service';
import { CorrelationReport, ParticipationReport } from '../../api/report-models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-participation-report',
  templateUrl: './participation-report.component.html',
  styleUrls: ['./participation-report.component.scss']
})
export class ParticipationReportComponent implements OnInit {
  series?: ParticipationReport;
  tracks?: ParticipationReport;
  seasons?: ParticipationReport;
  divisions?: ParticipationReport;
  modes?: ParticipationReport;
  correlations?: CorrelationReport;
  totalUserCount = 0;
  errorMessage = "";
  url = '';

  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.api.participationReport("series").subscribe(
      r => {
        this.series = r;
      }
    );

    this.api.participationReport("track").subscribe(
      r => {
        this.tracks = r;
      }
    );

    this.api.participationReport("season").subscribe(
      r => {
        this.seasons = r;
      }
    );

    this.api.participationReport("division").subscribe(
      r => {
        this.divisions = r;
      }
    );

    this.api.participationReport("mode").subscribe(
      r => {
        this.modes = r;
      }
    );

    this.api.correlationReport().subscribe(
      r => {
        this.correlations = r;
      }
    )
  }

  ngOnInit(): void {
  }

  downloadSeriesReport() {
    this.api.exportParticipationStats("series");
  }

  downloadTrackReport() {
    this.api.exportParticipationStats("track");
  }

  downloadSeasonReport() {
    this.api.exportParticipationStats("season");
  }

  downloadDivisionReport() {
    this.api.exportParticipationStats("division");
  }

  downloadModeReport() {
    this.api.exportParticipationStats("mode");
  }

  downloadCorrelationReport() {
    this.api.exportCorrelationStats();
  }
}
