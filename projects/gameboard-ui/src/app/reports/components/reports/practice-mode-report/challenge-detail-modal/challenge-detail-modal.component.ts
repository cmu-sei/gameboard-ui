import { Component, OnInit } from '@angular/core';
import { PracticeModeReportChallengeDetail, PracticeModeReportFlatParameters } from '../practice-mode-report.models';
import { PracticeModeReportService } from '../practice-mode-report.service';
import { PagingArgs, PagingResults } from '@/api/models';

@Component({
  selector: 'app-challenge-detail-modal',
  templateUrl: './challenge-detail-modal.component.html',
  styleUrls: ['./challenge-detail-modal.component.scss']
})
export class ChallengeDetailModalComponent implements OnInit {
  challengeSpecId?: string;
  parameters?: PracticeModeReportFlatParameters;

  protected errors: string[] = [];
  protected isLoading = false;
  protected pagingArgs?: PagingArgs;
  protected results?: PracticeModeReportChallengeDetail;

  constructor(private reportService: PracticeModeReportService) { }

  async ngOnInit() {
    await this.load(this.challengeSpecId, this.parameters);
  }

  protected async handlePaging(pagingArgs: PagingArgs) {
    await this.load(this.challengeSpecId, this.parameters, pagingArgs);
  }

  private async load(specId?: string, parameters?: PracticeModeReportFlatParameters, pagingArgs?: PagingArgs) {
    this.errors = [];

    if (!specId) {
      this.errors.push("Whoops. Something went wrong. Please contact your administrator.");
      throw new Error("ChallengeSpecId is required.");
    }

    this.isLoading = true;
    this.results = await this.reportService.getChallengeDetail(specId, parameters, pagingArgs);
    this.isLoading = false;

    this.pagingArgs = this.results.paging;
  }
}
