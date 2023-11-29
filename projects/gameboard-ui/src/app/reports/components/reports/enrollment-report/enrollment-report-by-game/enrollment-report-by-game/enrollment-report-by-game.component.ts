import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EnrollmentReportByGameRecord, EnrollmentReportByGameSponsor, EnrollmentReportFlatParameters } from '@/reports/components/reports/enrollment-report/enrollment-report.models';
import { ReportGame, ReportResults } from '@/reports/reports-models';
import { EnrollmentReportService } from '../../enrollment-report.service';
import { firstValueFrom } from 'rxjs';
import { RouterService } from '@/services/router.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { EnrollmentReportSponsorPlayerCountModalComponent, EnrollmentReportSponsorPlayerCountModalContext } from '../../enrollment-report-sponsor-player-count-modal/enrollment-report-sponsor-player-count-modal/enrollment-report-sponsor-player-count-modal.component';

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
    private modalService: ModalConfirmService,
    private routerService: RouterService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.loadData(this.parameters);
  }

  protected handleSponsorsCountClick(game: ReportGame, sponsors: EnrollmentReportByGameSponsor[]) {
    this.modalService.openComponent<EnrollmentReportSponsorPlayerCountModalComponent, EnrollmentReportSponsorPlayerCountModalContext>({
      content: EnrollmentReportSponsorPlayerCountModalComponent,
      context: {
        game: { id: game.id, name: game.name },
        sponsors: sponsors
      }
    });
  }

  private async loadData(parameters: EnrollmentReportFlatParameters | null) {
    this.results = await firstValueFrom(this.enrollmentReportService.getByGameData(this.parameters));
  }
}
