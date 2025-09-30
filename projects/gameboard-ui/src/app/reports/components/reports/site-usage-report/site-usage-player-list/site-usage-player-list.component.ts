// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PagedArray, PagingArgs } from '@/api/models';
import { Component, OnInit } from '@angular/core';
import { SiteUsageReportFlatParameters, SiteUsageReportPlayer, SiteUsageReportPlayersModalParameters } from '../site-usage-report.models';
import { SiteUsageReportService } from '../site-usage-report.service';

@Component({
    selector: 'app-site-usage-player-list',
    templateUrl: './site-usage-player-list.component.html',
    standalone: false
})
export class SiteUsagePlayerListComponent implements OnInit {
  title = "Players";
  subtitle = "";
  playerParameters?: SiteUsageReportPlayersModalParameters;
  reportParameters?: SiteUsageReportFlatParameters;

  protected isLoading = false;
  protected results?: PagedArray<SiteUsageReportPlayer>;

  constructor(private reportService: SiteUsageReportService) { }

  async ngOnInit() {
    await this.load();
  }

  protected async load(pagingArgs?: PagingArgs) {
    console.log("paging args", pagingArgs);
    if (!this.reportParameters)
      throw new Error("No parameters passed.");

    this.isLoading = true;
    this.results = await this.reportService.getPlayers(this.reportParameters, this.playerParameters, pagingArgs);
    this.isLoading = false;
  }
}
