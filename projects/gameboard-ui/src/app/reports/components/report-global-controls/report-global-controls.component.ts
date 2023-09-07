import { ActiveReportService } from '@/reports/services/active-report.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-report-global-controls',
  templateUrl: './report-global-controls.component.html',
  styleUrls: ['./report-global-controls.component.scss']
})
export class ReportGlobalControlsComponent {
  @Output() exportRequestCsv = new EventEmitter<void>();

  constructor(
    private activeReportService: ActiveReportService,
    private modal: ModalConfirmService,
    private routerService: RouterService) { }

  handleAboutFiltersClick() {
    this.modal.openConfirm({
      title: "About report filters",
      bodyContent: `
        You can use filters to constrain the data that a report includes. For example, if you're interested in seeing only enrollments from a given sponsor (or subset of sponsors)
        in the Enrollment report, you can use the Sponsors filter to select the sponsors you're interested in. If you don't choose any values in the Sponsors filter, data from all
        sponsors will be included.

        When you run a report, your browser will generate a link that represents your filter selections for the current report. If you want to share what you're seeing with another
        Gameboard user, you can copy the link in your browser's address bar (or click the "Copy" button) and send it to them.
      `,
      renderBodyAsMarkdown: true,
      hideCancel: true
    });
  }

  async handleResetClick() {
    await this.routerService.deleteQueryParams();
    this.activeReportService.parametersReset$.next();
  }
}
