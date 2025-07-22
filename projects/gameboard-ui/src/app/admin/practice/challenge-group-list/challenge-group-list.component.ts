import { CoreModule } from '@/core/core.module';
import { ChallengeGroupCardComponent } from '@/prac/components/challenge-group-card/challenge-group-card.component';
import { CreatePracticeChallengeGroupRequest, ListChallengeGroupsResponseGroup, UpdateChallengeGroupRequest } from '@/prac/practice.models';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeService } from '@/services/practice.service';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { Component, computed, inject, model, resource, TemplateRef, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChallengeGroupUpsertDialogComponent, UpsertChallengeGroup } from '../challenge-group-upsert-dialog/challenge-group-upsert-dialog.component';

@Component({
  selector: 'app-challenge-group-list',
  imports: [
    FontAwesomeModule,
    CoreModule,
    ChallengeGroupCardComponent,
    ChallengeGroupUpsertDialogComponent,
    SpinnerComponent,
    ErrorDivComponent
  ],
  templateUrl: './challenge-group-list.component.html',
  styleUrl: './challenge-group-list.component.scss'
})
export class ChallengeGroupListComponent {
  private readonly modalService = inject(ModalConfirmService);
  private readonly practiceService = inject(PracticeService);

  protected errors: any[] = [];
  protected fa = fa;
  protected editGroup = model<UpsertChallengeGroup>();
  protected existingGroupsResource = resource({
    loader: () => this.practiceService.challengeGroupList()
  });
  protected existingGroups = computed(() => this.existingGroupsResource.value());
  protected readonly upsertGroupModalTemplate = viewChild<TemplateRef<any>>("upsertGroupModal");

  protected handleOpenCreateDialog() {
    if (!this.upsertGroupModalTemplate()) {
      this.errors.push("Couldn't resolve the group dialog.");
    }

    this.editGroup.update(() => undefined);
    this.modalService.openTemplate(this.upsertGroupModalTemplate()!);
  }

  protected handleOpenDeleteDialog(group: ListChallengeGroupsResponseGroup) {
    const subcollectionsText = group.childGroups.length > 0 ? " Its subcollections will also be deleted." : "";

    this.modalService.openConfirm({
      title: "Delete Collection",
      subtitle: group.name,
      bodyContent: `Are you sure you want to delete the collection **${group.name}**?${subcollectionsText}\n\nAny challenges it contains will still be available in the Practice Area.`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await this.practiceService.challengeGroupDelete(group.id);
        this.existingGroupsResource.reload();
      }
    });
  }

  protected handleOpenEditDialog(group: ListChallengeGroupsResponseGroup) {
    if (!this.upsertGroupModalTemplate()) {
      this.errors.push("Couldn't resolve the group dialog.");
    }

    this.editGroup.update(() => ({
      ...group,
      previousImageUrl: group.imageUrl,
    }));
    this.modalService.openTemplate(this.upsertGroupModalTemplate()!);
  }

  protected async handleGroupSaved(value: CreatePracticeChallengeGroupRequest | UpdateChallengeGroupRequest) {
    this.errors = [];
    try {
      this.existingGroupsResource.reload();
    }
    catch (err) {
      this.errors.push(err);
    }
  }
}
