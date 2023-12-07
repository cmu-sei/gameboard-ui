import { ChallengeSubmissionViewModel } from '@/api/challenges.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'indexToSubmittedAnswer' })
export class IndexToSubmittedAnswerPipe implements PipeTransform {
  transform(index: number, arg: ChallengeSubmissionViewModel[]): string {
    if (index < 0 || !arg || !arg.length) {
      throw new Error("Can't use IndexToSubmittedAnswer pipe without an index and submitted answers.");
    }

    if (index > arg.length)
      throw new Error(`Can't use IndexToSubmittedAnswer pipe with an out-of-range index (${index}, ${arg.length})`);

    return arg.map(submission => `"${submission.answers[index]}"`).join(", ");
  }
}
