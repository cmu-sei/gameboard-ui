import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EnrollmentReportByGameRecord, EnrollmentReportByGameSponsor, EnrollmentReportFlatParameters } from '@/reports/components/reports/enrollment-report/enrollment-report.models';
import { ReportGame, ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '@/reports/components/reports/enrollment-report/enrollment-report.service';
import { firstValueFrom } from 'rxjs';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { EnrollmentReportSponsorPlayerCountModalComponent, EnrollmentReportSponsorPlayerCountModalContext } from '../enrollment-report-sponsor-player-count-modal/enrollment-report-sponsor-player-count-modal.component';
import { PagingArgs } from '@/api/models';
import { RouterService } from '@/services/router.service';

@Component({
    selector: 'app-enrollment-report-by-game',
    templateUrl: './enrollment-report-by-game.component.html',
    styleUrls: ['./enrollment-report-by-game.component.scss'],
    standalone: false
})
export class EnrollmentReportByGameComponent implements OnChanges {
  @Input() parameters!: EnrollmentReportFlatParameters | null;

  protected isLoading = false;
  protected results: ReportResults<EnrollmentReportByGameRecord> | null = null;

  constructor(
    private enrollmentReportService: EnrollmentReportService,
    private modalService: ModalConfirmService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes.parameters)
      return;

    await this.loadData(this.parameters);
  }

  protected handlePagingChange(request: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...request } });
  }

  protected handleSponsorsCountClick(game: ReportGame, sponsors: EnrollmentReportByGameSponsor[]) {
    this.modalService.openComponent<EnrollmentReportSponsorPlayerCountModalComponent>({
      content: EnrollmentReportSponsorPlayerCountModalComponent,
      context: {
        context: {
          game: { id: game.id, name: game.name },
          sponsors: sponsors,
        }
      },
      modalClasses: ["modal-lg"]
    });
  }

  private async loadData(parameters: EnrollmentReportFlatParameters | null) {
    this.isLoading = true;
    this.results = await firstValueFrom(this.enrollmentReportService.getByGameData(parameters));
    this.isLoading = false;
  }
}
