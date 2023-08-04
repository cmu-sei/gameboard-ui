import { ChallengeResult } from '@/api/board-models';
import { SimpleEntity } from '@/api/models';
import { ReportGame } from '@/reports/reports-models';
import { Component, Input } from '@angular/core';

export interface ChallengeAttemptSummary {
  challengeSpec: SimpleEntity,
  game: ReportGame,
  maxPossibleScore: number,
  result: ChallengeResult,
  score: number;
  scorePercentile?: number
}

@Component({
  selector: 'app-challenge-attempt-summary',
  templateUrl: './challenge-attempt-summary.component.html',
  styleUrls: ['./challenge-attempt-summary.component.scss']
})
export class ChallengeAttemptSummaryComponent {
  @Input() attempt?: ChallengeAttemptSummary;
  @Input() primaryData: "challengeName" | "date" = "challengeName";
}
