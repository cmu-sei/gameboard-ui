import { Component, OnInit } from '@angular/core';
import { PracticeModeReportChallengeDetail, PracticeModeReportChallengeDetailParameters, PracticeModeReportFlatParameters } from '../practice-mode-report.models';
import { PracticeModeReportService } from '../practice-mode-report.service';
import { PagingArgs } from '@/api/models';
import { ChallengeResult } from '@/api/board-models';

@Component({
    selector: 'app-challenge-detail-modal',
    templateUrl: './challenge-detail-modal.component.html',
    styleUrls: ['./challenge-detail-modal.component.scss'],
    standalone: false
})
export class ChallengeDetailModalComponent implements OnInit {
  challengeSpecId?: string;
  challengeDetailParameters?: PracticeModeReportChallengeDetailParameters;
  parameters?: PracticeModeReportFlatParameters;

  protected errors: string[] = [];
  protected isLoading = false;
  protected pagingArgs?: PagingArgs;
  protected results?: PracticeModeReportChallengeDetail;
  protected subtitleComputed = "Practice Mode Performance";

  constructor(private reportService: PracticeModeReportService) { }

  async ngOnInit() {
    await this.load(this.challengeSpecId, this.parameters, this.challengeDetailParameters);
  }

  protected async handlePaging(pagingArgs: PagingArgs) {
    await this.load(this.challengeSpecId, this.parameters, this.challengeDetailParameters, pagingArgs);
  }

  private async load(specId?: string, parameters?: PracticeModeReportFlatParameters, challengeDetailParameters?: PracticeModeReportChallengeDetailParameters, pagingArgs?: PagingArgs) {
    this.errors = [];

    if (!specId) {
      this.errors.push("Whoops. Something went wrong. Please contact your administrator.");
      throw new Error("ChallengeSpecId is required.");
    }

    this.isLoading = true;
    this.results = await this.reportService.getChallengeDetail(specId, parameters, challengeDetailParameters, pagingArgs);
    this.isLoading = false;

    this.pagingArgs = this.results.paging;

    if (this.challengeDetailParameters?.playersWithSolveType) {
      this.subtitleComputed = `Practice Mode Performance (best attempt: ${this.challengeDetailParameters.playersWithSolveType})`;
    }
  }
}
