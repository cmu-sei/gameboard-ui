import { Component, Input, OnInit } from '@angular/core';
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
  styleUrls: ['./enrollment-report-by-game.component.scss']
})
export class EnrollmentReportByGameComponent implements OnInit {
  @Input() parameters!: EnrollmentReportFlatParameters | null;

  protected results: ReportResults<EnrollmentReportByGameRecord> | null = null;

  constructor(
    private enrollmentReportService: EnrollmentReportService,
    private modalService: ModalConfirmService,
    private routerService: RouterService) { }

  async ngOnInit(): Promise<void> {
    await this.loadData(this.parameters);
  }

  protected handlePagingChange(request: PagingArgs) {
    this.routerService.updateQueryParams({ parameters: { ...request } });
  }

  protected handleSponsorsCountClick(game: ReportGame, sponsors: EnrollmentReportByGameSponsor[]) {
    this.modalService.openComponent<EnrollmentReportSponsorPlayerCountModalComponent, EnrollmentReportSponsorPlayerCountModalContext>({
      content: EnrollmentReportSponsorPlayerCountModalComponent,
      context: {
        game: { id: game.id, name: game.name },
        sponsors: sponsors,
      },
      modalClasses: ["modal-xl"]
    });
  }

  private async loadData(parameters: EnrollmentReportFlatParameters | null) {
    this.results = await firstValueFrom(this.enrollmentReportService.getByGameData(parameters));
  }
}
