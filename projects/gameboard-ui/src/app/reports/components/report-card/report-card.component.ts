import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LogService } from '../../../services/log.service';
import { SlugService } from '../../../services/slug.service';
import { Report } from '../../reports-models';

@Component({
  selector: 'app-report-card',
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss']
})
export class ReportCardComponent implements OnChanges {
  @Input() report?: Report;

  protected reportUrl?: string;

  constructor(
    private logService: LogService,
    private slugService: SlugService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.report) {
      this.logService.logError(`Couldn't set up navigation to report, as it's a falsey thing: ${this.report}`)
    }

    const report = this.report!;
    this.reportUrl = `/reports/${this.slugService.slugify(report.name)}`;
  }
}
