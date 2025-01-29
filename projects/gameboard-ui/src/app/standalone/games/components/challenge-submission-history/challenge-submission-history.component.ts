import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengesService } from '@/api/challenges.service';
import { ChallengeSubmissionHistory } from '@/api/challenges.models';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { Challenge } from '@/api/board-models';
import { firstValueFrom } from 'rxjs';
import { CoreModule } from '@/core/core.module';
import { ChallengeSubmissionsService } from '@/api/challenge-submissions.service';

@Component({
  selector: 'app-challenge-submission-history',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    SpinnerComponent
  ],
  templateUrl: './challenge-submission-history.component.html',
  styleUrls: ['./challenge-submission-history.component.scss']
})
export class ChallengeSubmissionHistoryComponent implements OnInit {
  @Input() challengeId?: string;
  private _challengeService = inject(ChallengesService);
  private _challengeSubmissionsService = inject(ChallengeSubmissionsService);

  protected challenge?: Challenge;
  protected submissionHistory?: ChallengeSubmissionHistory;

  async ngOnInit() {
    if (!this.challengeId) {
      throw new Error("ChallengeId is required");
    }

    this.challenge = await firstValueFrom(this._challengeService.retrieve(this.challengeId));
    this.submissionHistory = await this._challengeSubmissionsService.getSubmissions(this.challengeId);
  }
}
