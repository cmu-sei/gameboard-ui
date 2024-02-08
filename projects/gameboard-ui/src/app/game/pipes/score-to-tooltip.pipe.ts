import { DenormalizedTeamScore } from '@/services/scoring/scoring.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'scoreToTooltip' })
export class ScoreToTooltipPipe implements PipeTransform {

  transform(value: DenormalizedTeamScore): string {
    if (!value || value.scoreOverall === 0 || value.scoreOverall === value.scoreChallenge)
      return "";

    return `${value.scoreChallenge} + ${value.scoreAutoBonus + value.scoreAutoBonus} bonus (Click for details)`;
  }
}
