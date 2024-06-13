import { DenormalizedTeamScore } from '@/services/scoring/scoring.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'scoreToTooltip' })
export class ScoreToTooltipPipe implements PipeTransform {
  transform(value: DenormalizedTeamScore): string {
    if (!value || value.scoreOverall === 0 || value.scoreOverall === value.scoreChallenge)
      return "";

    let previousGameClause = "";
    if (value.scoreAdvanced || 0) {
      previousGameClause = ` + ${value.scoreAdvanced || 0} previous`;
    }

    let bonusClause = "";
    const bonusPoints = (value.scoreAutoBonus || 0) || (value.scoreManualBonus || 0);
    if (bonusPoints)
      bonusClause = ` + ${bonusPoints} bonus `;

    return `${value.scoreChallenge}${previousGameClause}${bonusClause} (click for details)`;
  }
}
