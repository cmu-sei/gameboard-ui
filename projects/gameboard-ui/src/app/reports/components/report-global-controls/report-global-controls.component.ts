import { ActiveReportService } from '@/reports/services/active-report.service';
import { LogService } from '@/services/log.service';
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
  @Output() exportRequestPdf = new EventEmitter<void>();

  constructor(
    private activeReportService: ActiveReportService,
    private logService: LogService,
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
      renderBodyAsMarkdown: true
    });
  }

  handleKnownIssuesClick() {
    this.modal.openConfirm({
      title: "Known issues",
      bodyContent: `
        We're aware of several issues with the current build of this screen and are addressing them as efficiently
        possible. If you experience an issue NOT listed here, please let us know!

        - **The "Export to CSV" button** does not give visual feedback to indicate that it's creating the CSV when clicked. For now, wait 10-15 seconds for it to assemble the document, and if it doesn't, let us know. We'll be improving this experience soon.
        - **The "Report Select" dropdown** at the upper left of the page appears blank on initial page load. (It displays the correct value after it's touched by the user once.)
        - **Filter controls** do not reflect their currently selected values if you open a link to the reports page which includes filtering. For example, [this link](/reports/enrollment?track=Track%20%A) should open to the Enrollment Report with Track A selected, and it will display results correctly. However, the track filter does not show that Track A is selected.
        - The **Game/Challenge** filter on the Support Report has no effect on the report's results.
      `,
      renderBodyAsMarkdown: true
    });
  }

  handleResetClick() {
    const key = this.activeReportService.metaData$.value?.key;
    if (!key)
      this.logService.logError(`Can't reset report without metadata report key: "${key}".`);
    this.routerService.toReport(key!);
    this.activeReportService.parameterResetRequest$.next();
  }
}
