import { Pipe, PipeTransform } from '@angular/core';
import { ChallengeSubmissionViewModelLegacy } from '@/api/challenges.models';
import { unique } from '@/../tools/tools';

// takes the index of a challenge question (e.g. 1 = the second question of the challenge), returns a string which concatenates
// all unique answers submitted for the question
@Pipe({
  name: 'indexToSubmittedAnswers',
  standalone: false
})
export class IndexToSubmittedAnswersPipe implements PipeTransform {
  transform(questionIndex: number, submissions: ChallengeSubmissionViewModelLegacy[], hideLastResponse = false): string {
    if (questionIndex < 0 || !submissions || !submissions.length) {
      return "";
    }

    // ensure that all submissions have at least as many answers as are required to retrieve the questionIndexth answer
    const submissionLengths = submissions.map(s => s.answers.length);
    if (submissionLengths.some(length => length <= questionIndex)) {
      return "";
    }

    // the final submitted answer may be the correct answer (if they got the question right). We show that elsewhere, so hide
    // it if requested
    let displayedSubmissions = [...submissions];
    if (hideLastResponse)
      displayedSubmissions = displayedSubmissions.slice(0, displayedSubmissions.length - 1);

    return unique(
      displayedSubmissions
        .map(submission => `${submission.answers[questionIndex] ? `"${submission.answers[questionIndex]}"` : "(no response)"}`)
    ).join(", ");
  }
}
