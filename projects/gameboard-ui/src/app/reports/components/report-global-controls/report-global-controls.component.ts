import { ActiveReportService } from '@/reports/services/active-report.service';
import { RouterService } from '@/services/router.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-report-global-controls',
  templateUrl: './report-global-controls.component.html',
  styleUrls: ['./report-global-controls.component.scss']
})
export class ReportGlobalControlsComponent {
  @Input() enableExport = true;
  @Output() exportRequestCsv = new EventEmitter<void>();

  constructor(
    private activeReportService: ActiveReportService,
    private routerService: RouterService) { }

  async handleResetClick() {
    await this.routerService.deleteQueryParams();
    this.activeReportService.parametersReset$.next();
  }

  async handleGenerateClick() {
    this.activeReportService.generateRequested$.next();
  }
}
