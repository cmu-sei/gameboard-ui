import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, map } from 'rxjs';
import { ChallengeProgressView, ChallengeProgressViewSection } from '@/api/challenges.models';
import { ChallengesService } from '@/api/challenges.service';
import { CoreModule } from '@/core/core.module';
import { fa } from '@/services/font-awesome.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { HoldConfirmButtonComponent } from "@/standalone/core/components/hold-confirm-button/hold-confirm-button.component";
import { ToastService } from '@/utility/services/toast.service';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChallengeQuestionsFormService } from '@/services/challenge-questions-form.service';
import { EpochMsToTimeRemainingStringPipe } from '@/standalone/core/pipes/epoch-ms-to-time-remaining.pipe';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ChallengeSubmissionHistoryComponent } from "../challenge-submission-history/challenge-submission-history.component";
import { SimpleEntity } from '@/api/models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';

interface SectionTabViewModel {
  index: number;
  friendlyIndex: number;
  questionsRemaining?: number;
  isAvailable: boolean;
  section?: ChallengeProgressViewSection;
  form?: FormGroup;
}

@Component({
  selector: 'app-challenge-questions',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    EpochMsToTimeRemainingStringPipe,
    SpinnerComponent,
    HoldConfirmButtonComponent,
    ChallengeSubmissionHistoryComponent
  ],
  providers: [ActiveChallengesRepo, ModalConfirmService],
  templateUrl: "./challenge-questions.component.html",
  styleUrls: ["./challenge-questions.component.scss"]
})
export class ChallengeQuestionsComponent implements OnChanges {
  @Input() challengeId?: string;
  @Input() size: "normal" | "compact" = "normal";

  protected endsAt$ = this.activeChallengesRepo.activePracticeChallenge$.pipe(map(c => c?.endsAt));
  protected fa = fa;
  protected hasSubmissionHistory = false;
  protected isGrading = false;
  protected progress?: ChallengeProgressView;
  protected sectionTabs: SectionTabViewModel[] = [];
  protected selectedSectionIndex = 0;
  protected spec?: SimpleEntity;
  protected team?: SimpleEntity;

  @ViewChild('submissionHistoryModal') protected submissionHistoryModalTemplate?: TemplateRef<any>;

  constructor(
    private activeChallengesRepo: ActiveChallengesRepo,
    private challengeService: ChallengesService,
    private formService: ChallengeQuestionsFormService,
    private modalConfirmService: ModalConfirmService,
    private toastService: ToastService) {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!changes.challengeId)
      return;

    if (!this.challengeId) {
      this.progress = undefined;
      return;
    }

    await this.load(this.challengeId);
  }

  protected handleSectionSelect(sectionIndex: number) {
    this.selectedSectionIndex = sectionIndex;

    if (!this.progress) {
      return;
    }
  }

  protected async handleSubmit(formData: AbstractControl) {
    this.isGrading = true;
    const presubmitScore = this.progress?.score || 0;
    await firstValueFrom(this.challengeService.grade(this.formService.getSubmission(formData)));
    await this.load(this.challengeId!);
    this.isGrading = false;

    if (!this.progress)
      return;

    if (this.progress.score === presubmitScore && this.progress.score < this.progress.maxPoints) {
      // let's be encouraging, shall we?
      this.toastService.showMessage("Not quite... keep trying!");
    }

    if (this.progress.score >= this.progress.maxPoints) {
      this.toastService.showMessage("Whoa, nice! You've **completely solved** this challenge. Well done!");
    }
    else if (this.progress.score > presubmitScore) {
      this.toastService.showMessage(`Nailed it! Your score has increased to **${this.progress?.score}**.`);
    }
  }

  protected handleViewSubmissionHistory(challengeId: string) {
    if (!this.submissionHistoryModalTemplate) {
      throw new Error("Couldn't resolve submission history template.");
    }

    this.modalConfirmService.openTemplate(this.submissionHistoryModalTemplate);
  }

  private async load(challengeId: string) {
    const response = await this.challengeService.getProgress(challengeId);
    this.progress = response.progress;

    // grab the team and spec for display purposes
    this.spec = response.spec;
    this.team = response.team;

    if (!this.progress) {
      this.sectionTabs = [];
      return;
    }

    // some challenges have multiple sections, so we need to present a tabbed interface with a tab for
    // each. However, sections can also have prerequisities, and if they do, the game engine won't send
    // down question data until those are met. We still want to hint that they're coming by showing a disabled
    // tab, so track how many total sections there are in a range we can iterate on 
    this.sectionTabs = [...Array(this.progress.variant.totalSectionCount).keys()].map(sectionIndex => {
      if (!this.challengeId) {
        throw new Error("ChallengeId is required");
      }

      const isAvailable = !!this.progress && this.progress.variant.sections.length > sectionIndex;
      if (!isAvailable) {
        return {
          friendlyIndex: sectionIndex + 1,
          index: sectionIndex,
          isAvailable: false,
        };
      }

      const section = this.progress!.variant.sections[sectionIndex];

      return {
        friendlyIndex: sectionIndex + 1,
        index: sectionIndex,
        isAvailable: isAvailable,
        isMultiSection: this.progress!.variant.totalSectionCount > 1,
        questionsRemaining: section.questions.filter(q => !q.isCorrect).length,
        section: section,
        form: this.formService.buildSectionForm(this.challengeId, sectionIndex, section)
      };
    });

    // select the "last" tab with unanswered questions
    this.handleSectionSelect(this.progress.variant.sections.length - 1);

    // find out if any submissions have been made (decides the availability of the "submission history" modal)
    this.hasSubmissionHistory = this.progress.attempts > 0;
  }
}
