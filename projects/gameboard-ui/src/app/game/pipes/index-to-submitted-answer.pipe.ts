import { ChallengeSubmissionViewModel } from '@/api/challenges.models';
import { Pipe, PipeTransform } from '@angular/core';
import { unique } from 'projects/gameboard-ui/src/tools';

@Pipe({ name: 'indexToSubmittedAnswer' })
export class IndexToSubmittedAnswerPipe implements PipeTransform {
  transform(index: number, submissions: ChallengeSubmissionViewModel[], hideLastResponse = false): string {
    if (index < 0 || !submissions || !submissions.length)
      throw new Error("Can't use IndexToSubmittedAnswer pipe without an index and submitted answers.");

    if (index > submissions.length)
      throw new Error(`Can't use IndexToSubmittedAnswer pipe with an out-of-range index (${index}, ${submissions.length})`);

    // the final submitted answer may be the correct answer (if they got the question right). We show that elsewhere, so hide
    // it if requested
    let displayedSubmissions = [...submissions];
    if (hideLastResponse)
      displayedSubmissions = displayedSubmissions.slice(0, displayedSubmissions.length - 1);

    return unique(
      displayedSubmissions
        .map(submission => `${submission.answers[index] ? `"${submission.answers[index]}"` : "(no response)"}`)
    ).join(", ");
  }
}
