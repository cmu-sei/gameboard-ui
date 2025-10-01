// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, computed, effect, inject, input, output, resource, signal } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CoreModule } from '@/core/core.module';
import { MarkdownPlaceholderPipe } from '@/core/pipes/markdown-placeholder.pipe';
import { CreatePracticeChallengeGroupRequest, UpdateChallengeGroupRequest } from '@/prac/practice.models';
import { PracticeService } from '@/services/practice.service';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { RelativeImagePipe } from '@/core/pipes/relative-image.pipe';

export interface UpsertChallengeGroup {
  id: string;
  name: string;
  description: string;
  hasChildGroups: boolean;
  isFeatured: boolean;
  previousImageUrl?: string;
  parentGroupId?: string;
}

@Component({
  selector: 'app-challenge-group-upsert-dialog',
  imports: [
    CoreModule,
    ErrorDivComponent,
    MarkdownPlaceholderPipe,
    RelativeImagePipe
  ],
  templateUrl: './challenge-group-upsert-dialog.component.html',
  styleUrl: './challenge-group-upsert-dialog.component.scss'
})
export class ChallengeGroupUpsertDialogComponent {
  public group = input<Partial<UpsertChallengeGroup>>();
  public saved = output<CreatePracticeChallengeGroupRequest | UpdateChallengeGroupRequest>();

  private readonly practiceService = inject(PracticeService);
  protected errors: any[] = [];
  protected readonly isEditing = computed(() => !!this.upsertGroupForm.value.id);
  protected previewImageUrl = signal<string | null>(null);
  protected upsertGroupForm = new FormGroup({
    id: new FormControl(""),
    name: new FormControl("", Validators.required),
    description: new FormControl("", Validators.required),
    isFeatured: new FormControl(false),
    image: new FormControl<File | null>(null),
    parentGroupId: new FormControl<string | null>(null),
    previousImageUrl: new FormControl(""),
    removeImage: new FormControl(false)
  });
  protected availableParentGroupsResource = resource({ loader: () => this.practiceService.challengeGroupList({ getRootOnly: true }) });
  protected availableParentGroups = computed(() => this.availableParentGroupsResource.value());

  constructor() {
    effect(() => {
      // incoming edit request
      const group = this.group();
      if (group) {
        this.upsertGroupForm.patchValue(group);
        this.previewImageUrl.update(() => null);
      }
    });
  }

  protected async handleConfirm() {
    this.errors = [];

    try {
      if (this.upsertGroupForm.value.id) {
        await this.practiceService.challengeGroupUpdate(this.upsertGroupForm.value as UpdateChallengeGroupRequest);
        this.saved.emit(this.upsertGroupForm.value as UpdateChallengeGroupRequest);
      } else {
        await this.practiceService.challengeGroupCreate(this.upsertGroupForm.value as CreatePracticeChallengeGroupRequest);
        this.saved.emit(this.upsertGroupForm.value as CreatePracticeChallengeGroupRequest);
      }
      this.availableParentGroupsResource.reload();
    }
    catch (err) {
      this.errors.push(err);
    }
  }

  protected handleImagePicked(event: Event) {
    const inputElement = event?.target as HTMLInputElement;
    if (!inputElement || !inputElement.files) {
      this.previewImageUrl.update(() => null);
      this.upsertGroupForm.patchValue({ image: null });
      return;
    }

    const file = inputElement.files[0];
    this.previewImageUrl.update(() => URL.createObjectURL(file));
    this.upsertGroupForm.patchValue({ image: file || null });
  }

  protected handleRevertToDefaultImage() {
    this.upsertGroupForm.patchValue({ image: null, previousImageUrl: null, removeImage: true });
    this.previewImageUrl.update(() => null);
  }
}
