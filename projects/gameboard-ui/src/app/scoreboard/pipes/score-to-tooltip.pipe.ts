import { DenormalizedTeamScore, Score } from '@/services/scoring/scoring.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'scoreToTooltip',
    standalone: false
})
export class ScoreToTooltipPipe implements PipeTransform {
  transform(value: DenormalizedTeamScore | Score): string {
    if (!value)
      return "";

    if ("scoreOverall" in value) {
      const denormalizedScore = value as DenormalizedTeamScore;
      return this.buildTooltip({
        totalScore: denormalizedScore.scoreOverall,
        completionScore: denormalizedScore.scoreChallenge,
        autoBonusScore: denormalizedScore.scoreAutoBonus,
        manualBonusScore: denormalizedScore.scoreManualBonus,
        advancedScore: denormalizedScore.scoreAdvanced,
      });
    }

    const score = value as Score;
    return this.buildTooltip({
      totalScore: score.totalScore,
      completionScore: score.completionScore,
      autoBonusScore: score.bonusScore,
      manualBonusScore: score.manualBonusScore,
      advancedScore: score.advancedScore
    });
  }

  private buildTooltip(score: { totalScore: number, completionScore: number, autoBonusScore: number, manualBonusScore: number, advancedScore?: number }) {
    if (!score.totalScore || score.totalScore === 0 || score.totalScore == score.completionScore)
      return "";

    let previousGameClause = "";
    if (score.advancedScore || 0) {
      previousGameClause = ` + ${score.advancedScore || 0} previous`;
    }

    let bonusClause = "";
    const bonusPoints = (score.autoBonusScore || 0) || (score.manualBonusScore || 0);
    if (bonusPoints)
      bonusClause = ` + ${bonusPoints} bonus `;

    return `${score.completionScore}${previousGameClause}${bonusClause} (click for details)`;
  }
}
