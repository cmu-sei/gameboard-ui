// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CoreModule } from '@/core/core.module';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeService } from '@/services/practice.service';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { Component, computed, inject, model, resource, TemplateRef, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChallengeGroupUpsertDialogComponent, UpsertChallengeGroup } from '../challenge-group-upsert-dialog/challenge-group-upsert-dialog.component';
import { ChallengeGroupUserCardComponent } from "@/prac/components/challenge-group-user-card/challenge-group-user-card.component";
import { ChallengeGroupCardMenuComponent } from '../challenge-group-card-menu/challenge-group-card-menu.component';

@Component({
  selector: 'app-challenge-group-list',
  imports: [
    FontAwesomeModule,
    CoreModule,
    ChallengeGroupCardMenuComponent,
    ChallengeGroupUserCardComponent,
    ChallengeGroupUpsertDialogComponent,
    SpinnerComponent,
    ErrorDivComponent,
  ],
  templateUrl: './challenge-group-list.component.html',
  styleUrl: './challenge-group-list.component.scss'
})
export class ChallengeGroupListComponent {
  private readonly modalService = inject(ModalConfirmService);
  private readonly practiceService = inject(PracticeService);

  protected errors: any[] = [];
  protected readonly fa = fa;
  protected readonly editGroup = model<UpsertChallengeGroup>();
  protected readonly existingGroupsResource = resource({
    loader: () => this.practiceService.challengeGroupList({ getRootOnly: true })
  });
  protected readonly existingGroups = computed(() => this.existingGroupsResource.value());
  protected readonly upsertGroupModalTemplate = viewChild<TemplateRef<any>>("upsertGroupModal");

  protected handleOpenCreateDialog() {
    if (!this.upsertGroupModalTemplate()) {
      this.errors.push("Couldn't resolve the group dialog.");
    }

    this.editGroup.update(() => undefined);
    this.modalService.openTemplate(this.upsertGroupModalTemplate()!);
  }

  protected async handleGroupSaved() {
    this.errors = [];
    try {
      this.existingGroupsResource.reload();
    }
    catch (err) {
      this.errors.push(err);
    }
  }
}
