import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EnrollmentReportByGameRecord, EnrollmentReportFlatParameters } from '@/reports/components/reports/enrollment-report/enrollment-report.models';
import { ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '../../enrollment-report.service';
import { firstValueFrom } from 'rxjs';
import { PagingArgs } from '@/api/models';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-enrollment-report-by-game',
  templateUrl: './enrollment-report-by-game.component.html',
  styleUrls: ['./enrollment-report-by-game.component.scss']
})
export class EnrollmentReportByGameComponent implements OnChanges {
  @Input() parameters!: EnrollmentReportFlatParameters | null;

  protected results: ReportResults<EnrollmentReportByGameRecord> | null = null;

  constructor(
    private enrollmentReportService: EnrollmentReportService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.loadData(this.parameters);
  }

  private async loadData(parameters: EnrollmentReportFlatParameters | null) {
    this.results = await firstValueFrom(this.enrollmentReportService.getByGameData(this.parameters));
  }
}
