// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
    styleUrls: ['./challenge-attempt-summary.component.scss'],
    standalone: false
})
export class ChallengeAttemptSummaryComponent {
  @Input() attempt?: ChallengeAttemptSummary;
  @Input() primaryData: "challengeName" | "date" = "challengeName";
}
