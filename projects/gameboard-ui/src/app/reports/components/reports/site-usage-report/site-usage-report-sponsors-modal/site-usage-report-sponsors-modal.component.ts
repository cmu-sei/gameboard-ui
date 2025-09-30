// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { SiteUsageReportFlatParameters, SiteUsageReportSponsor } from '../site-usage-report.models';
import { SiteUsageReportService } from '../site-usage-report.service';

@Component({
    selector: 'app-site-usage-report-sponsors-modal',
    templateUrl: './site-usage-report-sponsors-modal.component.html',
    standalone: false
})
export class SiteUsageReportSponsorsModalComponent implements OnInit {
  title?: string;
  subtitle?: string;
  reportParameters?: SiteUsageReportFlatParameters;
  sponsors: SiteUsageReportSponsor[] = [];
  protected isLoading = false;

  constructor(private reportService: SiteUsageReportService) { }

  async ngOnInit(): Promise<void> {
    if (!this.reportParameters)
      throw new Error("No parameters passed for site usage report sponsors");

    await this.load(this.reportParameters);
  }

  private async load(params: SiteUsageReportFlatParameters) {
    this.isLoading = true;
    this.sponsors = await this.reportService.getSponsors(params);
    this.isLoading = false;
  }
}
