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

        - The **Enrollment** report shows large numbers of players with no enroll date. This is expected, as we added the ability to track enroll date for this feature. This also causes the **Enrollment Over Time** graph on the report to appear blank.
        - **The "Export to CSV" button** does not give visual feedback to indicate that it's creating the CSV when clicked. For now, wait 10-15 seconds for it to assemble the document, and if it doesn't, let us know. We'll be improving this experience soon.
        - Some reports dump an error message into the browser console when run. The error doesn't affect accuracy or functionality, but we're working on eliminating it.
        - The **Support** report's doughnut charts are currently computed based on the paged data, not the overall dataset which matches the criteria. This is not intended.
      `,
      renderBodyAsMarkdown: true
    });
  }

  async handleResetClick() {
    await this.routerService.deleteQueryParams();
  }
}
