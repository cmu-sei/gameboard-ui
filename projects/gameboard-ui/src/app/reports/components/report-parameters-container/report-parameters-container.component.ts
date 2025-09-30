// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ReportMetaData } from '@/reports/reports-models';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { deepEquals, isEmpty } from 'projects/gameboard-ui/src/tools/object-tools.lib';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-report-parameters-container',
    providers: [UnsubscriberService],
    template: `<div class="report-parameters-component mb-5" *ngIf="metaData$ | async">
    <hr />
    <div class="mb-4">
      <span class="about-filters-link btn-link fs-125" (click)="handleAboutFiltersClick()">
          [ About report filters ]
      </span>
  </div>
  <form #parametersForm="ngForm">
    <div class="parameters-container d-flex flex-wrap input-group-lg full-width">
        <ng-content></ng-content>
    </div>
  </form>

  @if (hasNewParameters) {
    <alert type="warning" [dismissible]="true" (onClosed)="handleDismiss()">
      You've updated this report's parameters. Hit <strong class="alert-link">Generate Report</strong> above to see updated results.
  </alert>
  }
  <hr />
</div>`,
    styleUrls: ['./report-parameters-container.component.scss'],
    standalone: false
})
export class ReportParametersContainerComponent implements OnInit {
  private activeReport = inject(ActiveReportService);
  private modal = inject(ModalConfirmService);
  private route = inject(ActivatedRoute);
  private unsub = inject(UnsubscriberService);

  private _lastParameters?: Params = undefined;

  protected hasNewParameters = false;
  protected metaData$: Observable<ReportMetaData | null> = this.activeReport.metaData$;

  ngOnInit(): void {
    this.unsub.add(this.activeReport.generateRequested$.subscribe(() => {
      this.hasNewParameters = false;
    }));

    this.unsub.add(this.route.queryParams.subscribe(params => {
      if (this._lastParameters && !deepEquals(this._lastParameters, params)) {
        this.hasNewParameters = true;
        this._lastParameters = params;
      }
      else {
        this._lastParameters = params;
      }
    }));
  }

  protected handleAboutFiltersClick() {
    this.modal.openConfirm({
      title: "About report filters",
      bodyContent: `
        You can use filters to constrain the data that a report includes. For example, if you're interested in seeing only enrollments from a given sponsor (or subset of sponsors)
        in the Enrollment report, you can use the **Sponsors** filter to select the sponsors you're interested in. If you don't choose any values in the **Sponsors** filter, data from all
        sponsors will be included.

        When you run a report, your browser will generate a link that represents your filter selections for the current report. If you want to share what you're seeing with another
        Gameboard user, you can copy the link in your browser's address bar (or click the **Copy** button) and send it to them.
      `,
      renderBodyAsMarkdown: true,
      hideCancel: true
    });
  }

  protected handleDismiss() {
    this.hasNewParameters = false;
  }
}
