import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-report-records',
  styles: [`
    .no-records-text {
      color: #888888;
      font-size: 2rem;
      margin-top: 2rem;
    }`
  ],
  template: `
  <div class="page-height d-flex flex-column align-items-center justify-content-center">
    <span class="no-records-text">There aren't any {{recordDescription || "records"}} which match your filtering criteria.</span>
  </div>
  `
})
export class NoReportRecordsComponent {
  @Input() recordDescription?: string;
}
