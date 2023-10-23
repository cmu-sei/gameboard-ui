import { ChallengeResult } from '@/api/board-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'challengeResultColor' })
export class ChallengeResultColorPipe implements PipeTransform {

  transform(value: ChallengeResult): string {
    if (!value || value == "none") {
      return "colorblind-danger";
    }

    if (value == "success") {
      return "text-success";
    }

    return "text-info";
  }
}
