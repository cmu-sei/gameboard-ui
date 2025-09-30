// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { PagedArray, PagingArgs } from '@/api/models';
import { SiteUsageReportChallenge, SiteUsageReportFlatParameters } from '../site-usage-report.models';
import { SiteUsageReportService } from '../site-usage-report.service';

@Component({
    selector: 'app-site-usage-report-challenges-list',
    templateUrl: './site-usage-report-challenges-list.component.html',
    standalone: false
})
export class SiteUsageReportChallengesListComponent implements OnInit {
  title?: string;
  subtitle?: string;
  isLoading = false;
  reportParameters?: SiteUsageReportFlatParameters;
  results?: PagedArray<SiteUsageReportChallenge>;

  constructor(private reportService: SiteUsageReportService) { }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(pagingArgs?: PagingArgs) {
    this.isLoading = true;
    this.results = await this.reportService.getChallenges(this.reportParameters || {}, pagingArgs);
    this.isLoading = false;
  }
}
