// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ReportService } from '../../api/report.service';
import { SeasonReport } from '../../api/report-models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-participation-report',
  templateUrl: './participation-report.component.html',
  styleUrls: ['./participation-report.component.scss']
})
export class ParticipationReportComponent implements OnInit {
  seasons?: SeasonReport;
  totalUserCount = 0;
  errorMessage = "";
  url = '';

  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.api.seasonReport().subscribe(
      r => {
        this.seasons = r;
      }
    );
  }

  ngOnInit(): void {
  }

  downloadSeasonReport() {
    this.api.exportSeasonStats();
  }
}
