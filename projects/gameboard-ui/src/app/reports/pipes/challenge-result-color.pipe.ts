import { ChallengeResult } from '@/api/board-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'challengeResultColor'
})
export class ChallengeResultColorPipe implements PipeTransform {

  transform(value: ChallengeResult): string {
    if (!value || value == ChallengeResult.None) {
      return "colorblind-danger";
    }

    if (value == ChallengeResult.Complete) {
      return "text-success";
    }

    return "text-info";
  }
}
