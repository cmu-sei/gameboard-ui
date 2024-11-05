import { SectionSubmission } from '@/api/board-models';
import { ChallengeProgressViewSection } from '@/api/challenges.models';
import { Injectable } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormControl, FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ChallengeQuestionsFormService {
  private specialKeys = ["challengeId", "sectionIndex"];

  buildSectionForm(challengeId: string, sectionIndex: number, section: ChallengeProgressViewSection): FormGroup {
    const controls: { [key: string]: FormControl } = {};
    controls["challengeId"] = new FormControl({ value: challengeId, disabled: true });
    controls["sectionIndex"] = new FormControl({ value: sectionIndex, disabled: true });

    for (let i = 0; i < section.questions.length; i++) {
      controls[this.buildQuestionFormName(sectionIndex, i)] = new FormControl({
        value: section.questions[i].isCorrect ? section.questions[i].answer : "",
        disabled: section.questions[i].isCorrect
      });
    }

    return new FormGroup(controls, {
      // this is really stupid, but i really don't get this API
      validators: (control: AbstractControl) => {
        const questionControls = this.getQuestionControls(control as FormGroup);

        if (questionControls.some(ctrl => ctrl.value && !ctrl.disabled))
          return null;

        return ["At least once new answer is required for submission"];
      }
    });
  }

  buildQuestionFormName(sectionIndex: number, questionIndex: number) {
    return `s${sectionIndex}q${questionIndex}`;
  }

  getSubmission(form: AbstractControl): SectionSubmission {
    const questionControls = this.getQuestionControls(form as FormGroup);
    const challengeId = form.get("challengeId")?.value;
    const sectionIndex = form.get("sectionIndex")?.value;

    if (!challengeId) {
      throw new Error(`Couldn't resolve challengeId for form: ${JSON.stringify(form)}`);
    }

    if (sectionIndex === undefined || sectionIndex === null) {
      throw new Error(`Couldn't resolve sectionIndex for form: ${JSON.stringify(form)}`);
    }

    return {
      id: challengeId,
      sectionIndex: sectionIndex,
      questions: questionControls.map(ctrl => ({ answer: ctrl.value }))
    };
  }

  private getQuestionControls(formGroup: FormGroup): AbstractControl[] {
    const controlKeys = Object.keys(formGroup.controls).filter(keyName => this.specialKeys.indexOf(keyName) < 0);
    return controlKeys.map(key => formGroup.controls[key] as AbstractControl);
  }
}
