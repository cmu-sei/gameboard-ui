import { ListPracticeChallengeGroupsResponseGroup } from '@/prac/models/list-practice-challenge-groups';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeService } from '@/services/practice.service';
import { Component, effect, inject, input, model, output, TemplateRef, viewChild } from '@angular/core';
import { ChallengeGroupUpsertDialogComponent, UpsertChallengeGroup } from '../challenge-group-upsert-dialog/challenge-group-upsert-dialog.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-challenge-group-card-menu',
  imports: [
    RouterLink,
    BsDropdownModule,
    FontAwesomeModule,
    ChallengeGroupUpsertDialogComponent,
  ],
  templateUrl: './challenge-group-card-menu.component.html',
  styleUrl: './challenge-group-card-menu.component.scss'
})
export class ChallengeGroupCardMenuComponent {
  public readonly group = input.required<ListPracticeChallengeGroupsResponseGroup>();
  public readonly error = output<string>();
  public readonly groupSaved = output<void>();
  public readonly groupDeleted = output<ListPracticeChallengeGroupsResponseGroup>();

  // services
  private readonly modalService = inject(ModalConfirmService);
  private readonly practiceService = inject(PracticeService);

  // component needs
  protected readonly editGroup = model<UpsertChallengeGroup>();
  protected readonly fa = fa;
  protected readonly upsertGroupModalTemplate = viewChild<TemplateRef<any>>("upsertGroupModal");

  constructor() {
    // when the group is set, update the editgroup model
    effect(() => {
      const group = this.group();

      this.editGroup.update(() => ({
        id: group.id,
        name: group.name,
        description: group.description,
        isFeatured: group.isFeatured,
        previousImageUrl: group.imageUrl,
        parentGroupId: group.parentGroup?.id
      }));
    })
  }

  protected handleOpenDeleteDialog(group: ListPracticeChallengeGroupsResponseGroup) {
    const subcollectionsText = group.childGroups.length > 0 ? " Its subcollections will also be deleted." : "";

    this.modalService.openConfirm({
      title: "Delete Collection",
      subtitle: group.name,
      bodyContent: `Are you sure you want to delete the collection **${group.name}**?${subcollectionsText}\n\nAny challenges it contains will still be available in the Practice Area.`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await this.practiceService.challengeGroupDelete(group.id);
        this.groupDeleted.emit(group);
      }
    });
  }

  protected handleOpenEditDialog(group: ListPracticeChallengeGroupsResponseGroup) {
    if (!this.upsertGroupModalTemplate()) {
      this.error.emit("Couldn't resolve the group dialog.")
    }

    this.editGroup.update(() => ({
      ...group,
      previousImageUrl: group.imageUrl,
    }));
    this.modalService.openTemplate(this.upsertGroupModalTemplate()!);
  }
}
