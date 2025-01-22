import { ReportMetaData } from '@/reports/reports-models';
import { ActiveReportService } from '@/reports/services/active-report.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report-parameters-container',
  template: `<div class="report-parameters-component mb-5" *ngIf="metaData$ | async">
    <hr />
    <form #parametersForm="ngForm">
      <div class="parameters-container d-flex flex-wrap input-group-lg full-width">
          <ng-content></ng-content>
      </div>
    </form>
    <hr />
</div>

<ng-template #loading><app-spinner>Loading your report</app-spinner></ng-template>`,
  styleUrls: ['./report-parameters-container.component.scss']
})
export class ReportParametersContainerComponent {
  protected metaData$: Observable<ReportMetaData | null> = this.activeReportService.metaData$;
  constructor(private activeReportService: ActiveReportService) { }
}
