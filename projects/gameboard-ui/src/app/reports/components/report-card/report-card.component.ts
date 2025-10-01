// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LogService } from '../../../services/log.service';
import { ReportViewModel } from '../../reports-models';

@Component({
    selector: 'app-report-card',
    templateUrl: './report-card.component.html',
    styleUrls: ['./report-card.component.scss'],
    standalone: false
})
export class ReportCardComponent implements OnChanges {
  @Input() report?: ReportViewModel;

  protected reportUrl?: string;

  constructor(private logService: LogService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.report.currentValue) {
      this.logService.logError(`Couldn't set up navigation to report, as it's a falsey thing: ${changes.report.currentValue}`);
    }

    this.reportUrl = `/reports/${changes.report.currentValue.key}`;
  }
}
