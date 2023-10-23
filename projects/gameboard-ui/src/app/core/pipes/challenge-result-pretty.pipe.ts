import { ChallengeResult } from '@/api/board-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'challengeResultPretty' })
export class ChallengeResultPrettyPipe implements PipeTransform {

  transform(value: ChallengeResult): string {
    if (!value || value == "none") {
      return "No Score";
    }

    if (value == "success") {
      return "Success";
    }

    return "Partial";
  }
}
