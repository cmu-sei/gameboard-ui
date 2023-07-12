import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PracticeModeReportByChallengeRecord, PracticeModeReportParameters } from '../practice-mode-report.models';
import { ReportResults } from '@/reports/reports-models';
import { firstValueFrom } from 'rxjs';
import { PagingRequest } from '@/core/components/select-pager/select-pager.component';
import { PracticeModeReportService } from '@/reports/services/practice-mode-report.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-practice-mode-report-by-challenge',
  templateUrl: './practice-mode-report-by-challenge.component.html',
  styleUrls: ['./practice-mode-report-by-challenge.component.scss']
})
export class PracticeModeReportByChallengeComponent implements OnChanges {
  @Input() parameters: PracticeModeReportParameters | null = null;

  protected results: ReportResults<PracticeModeReportByChallengeRecord> | null = null;

  constructor(
    private reportService: PracticeModeReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.parameters) {
      this.results = null;
    }

    if (changes.parameters.currentValue) {
      this.results = await firstValueFrom(this.reportService.getByChallengeData(changes.para.currentValue));
    }
  }

  handlePagingChange($event: PagingRequest) {
    this.routerService.updateQueryParams({ ...$event });
  }
}
