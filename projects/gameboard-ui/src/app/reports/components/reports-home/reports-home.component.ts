// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../reports.service';
import { ReportViewModel } from '../../reports-models';

@Component({
    selector: 'app-reports-home',
    templateUrl: './reports-home.component.html',
    styleUrls: ['./reports-home.component.scss'],
    standalone: false
})
export class ReportsHomeComponent implements OnInit {
  reports?: ReportViewModel[];

  constructor(private reportsService: ReportsService) { }

  async ngOnInit(): Promise<void> {
    this.reports = await this.reportsService.list();
  }
}
