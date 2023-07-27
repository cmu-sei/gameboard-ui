import { ChallengeResult } from '@/api/board-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'challengeResultPretty' })
export class ChallengeResultPrettyPipe implements PipeTransform {

  transform(value: ChallengeResult): string {
    if (!value || value == ChallengeResult.None) {
      return "Fail";
    }

    if (value == ChallengeResult.Complete) {
      return "Success";
    }

    return "Partial";
  }
}
