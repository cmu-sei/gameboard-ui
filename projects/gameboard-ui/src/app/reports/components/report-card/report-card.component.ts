import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LogService } from '../../../services/log.service';
import { ReportViewModel } from '../../reports-models';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss']
})
export class ReportCardComponent implements OnChanges {
  @Input() report?: ReportViewModel;

  protected reportUrl?: string;

  constructor(private logService: LogService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.report) {
      this.logService.logError(`Couldn't set up navigation to report, as it's a falsey thing: ${this.report}`)
    }

    this.reportUrl = `/reports/${this.report!.key}`;
  }
}
