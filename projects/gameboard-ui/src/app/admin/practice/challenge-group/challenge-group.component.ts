import { Component, computed, effect, inject, model, resource, signal, TemplateRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { CoreModule } from '@/core/core.module';
import { PracticeService } from '@/services/practice.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ChallengesAddToGroupRequest, GetPracticeChallengeGroupResponseChallenge, GetPracticeChallengeGroupResponseGroup, PracticeChallengeView } from '@/prac/practice.models';
import { ChallengeGroupCardComponent } from '@/prac/components/challenge-group-card/challenge-group-card.component';
import { fa } from '@/services/font-awesome.service';
import { AppTitleService } from '@/services/app-title.service';
import { ChallengeGroupUpsertDialogComponent, UpsertChallengeGroup } from '../challenge-group-upsert-dialog/challenge-group-upsert-dialog.component';
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';
import { ChallengeGroupCardImagePipe } from '@/prac/pipes/challenge-group-card-image.pipe';
import { GameService } from '@/api/game.service';
import { PlayerMode } from '@/api/player-models';
import { SimpleEntity } from '@/api/models';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-challenge-group',
  imports: [
    CoreModule,
    ChallengeGroupCardComponent,
    ChallengeGroupCardImagePipe,
    ChallengeGroupUpsertDialogComponent,
    PluralizerPipe,
    SpinnerComponent,
  ],
  templateUrl: './challenge-group.component.html',
  styleUrl: './challenge-group.component.scss'
})
export class ChallengeGroupComponent {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly gamesService = inject(GameService);
  private readonly groupId = toSignal(this.activeRoute.paramMap.pipe(map(p => p.get("id"))));
  private readonly modalService = inject(ModalConfirmService);
  private readonly practiceService = inject(PracticeService);
  private readonly router = inject(Router);
  private readonly title = inject(AppTitleService);
  private readonly toasts = inject(ToastService);

  protected readonly addChallengeModalTemplate = viewChild<TemplateRef<any>>("addChallengeModal");
  protected readonly addChildGroupModalTemplate = viewChild<TemplateRef<any>>("addChildGroupModal");
  protected readonly editGroupModalTemplate = viewChild<TemplateRef<any>>("editGroupModal");

  protected readonly challengesResource = resource({ loader: async () => this.practiceService.challengesList() });
  protected readonly gamesResource = resource({
    loader: async () => {
      return firstValueFrom(this.gamesService.list().pipe(
        map(games => games
          .filter(g => g.playerMode == PlayerMode.practice)
          .map(g => ({ id: g.id, name: g.name } as SimpleEntity))
          .sort((a, b) => a.name.localeCompare(b.name))
        )
      ));
    }
  });
  protected readonly groupResource = resource({
    request: () => ({ id: this.groupId() }),
    loader: ({ request }) => this.practiceService.challengeGroupGet(request.id!)
  });
  protected readonly settingsResource = resource({ loader: () => firstValueFrom(this.practiceService.getSettings()) });

  protected readonly addChallengesByValue = model<"challenge" | "game" | "tag">("challenge");
  protected readonly canAddSubCollections = computed(() => !this.groupResource.value()?.parentGroup);
  protected readonly challenges = computed(() => {
    // the API will reject duplicates, but hide any challenges already in the group
    const challenges = this.challengesResource.value();
    const group = this.groupResource.value();

    if (!challenges?.length) {
      return [];
    }

    return challenges.filter(c => group?.group.challenges.map(c => c.id).indexOf(c.id) === -1);
  });
  protected readonly creatingChildGroup = computed(() => ({ parentGroupId: this.group()?.id }));
  protected readonly editingGroup = signal<UpsertChallengeGroup | undefined>(undefined);
  protected readonly fa = fa;
  protected readonly group = computed(() => this.groupResource.value()?.group);
  protected readonly selectedChallenge = model<PracticeChallengeView>();
  protected readonly selectedGame = model<SimpleEntity>();
  protected readonly selectedTag = model<string>();
  protected readonly tags = computed(() => {
    const settings = this.settingsResource.value();
    return settings?.suggestedSearches?.sort() || [];
  });

  constructor() {
    // need to update the title based on the groupResource
    effect(() => {
      const group = this.groupResource.value();
      this.title.set(group?.group.name || "Practice Challenge Group");
    });

    // when challenges, games, and tags are loaded, automatically select the first one (so the add from x dropdowns
    // aren't blank)
    effect(() => {
      const challenges = this.challengesResource.value();
      if (challenges?.length) {
        this.selectedChallenge.update(() => challenges[0]);
      }
    });
    effect(() => {
      const games = this.gamesResource.value();
      if (games?.length) {
        this.selectedGame.update(() => games[0]);
      }
    });
    effect(() => {
      const tags = this.tags();
      if (tags.length) {
        this.selectedTag.update(() => tags[0]);
      }
    });
  }

  protected async handleAddChallenges() {
    if (!this.groupId()) {
      throw new Error("Can't resolve the groupId.");
    }

    const addChallengesRequest: ChallengesAddToGroupRequest = {};
    switch (this.addChallengesByValue()) {
      case "challenge":
        addChallengesRequest.addBySpecIds = [this.selectedChallenge()!.id];
        break;
      case "game":
        addChallengesRequest.addByGameId = this.selectedGame()!.id;
        break;
      case "tag":
        addChallengesRequest.addByTag = this.selectedTag();
        break;
    }

    const addedSpecIds = await this.practiceService.challengesAddToGroup(this.groupId()!, addChallengesRequest);
    this.toasts.showMessage(`Added **${addedSpecIds.addedChallengeSpecIds.length} challenges** to the **${this.group()?.name || ""}** group.`);
    this.groupResource.reload();
  }

  protected handleOpenAddSubCollectionModal() {
    if (!this.addChildGroupModalTemplate()) {
      throw new Error("Couldn't resolve the template.");
    }

    this.modalService.openTemplate(this.addChildGroupModalTemplate()!);
  }

  protected handleOpenEditCollectionModal(group: GetPracticeChallengeGroupResponseGroup, parentGroupId?: string) {
    if (!this.editGroupModalTemplate()) {
      throw new Error("Couldn't resolve the template.");
    }

    this.editingGroup.update(() => {
      return {
        ...group,
        parentGroupId: parentGroupId,
        previousImageUrl: group.imageUrl
      };
    });

    this.modalService.openTemplate(this.editGroupModalTemplate()!);
  }

  protected handleDeleteCollectionModal(group: GetPracticeChallengeGroupResponseGroup, hasChildGroups: boolean) {
    const childGroupsText = !hasChildGroups ? "" : " Its subcollections will also be deleted.";
    this.modalService.openConfirm({
      title: "Delete Collection",
      subtitle: group.name,
      bodyContent: `Are you sure you want to delete the collection **${group.name}**?${childGroupsText}\n\nChallenges in the collection will still be available in the Practice Area.`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await this.practiceService.challengeGroupDelete(group.id);

        if (group.id === this.groupResource.value()?.group?.id) {
          // if the deleted group is this page's group, return to the group list screen
          this.router.navigateByUrl("/admin/practice/content");
        } else {
          // otherwise, just reload
          this.groupResource.reload();
        }
      }
    });
  }

  protected handleGroupSaved() {
    this.groupResource.reload();
  }

  protected handleOpenAddChallengeModal() {
    if (!this.addChallengeModalTemplate()) {
      throw new Error("Couldn't resolve the modal.");
    }

    this.modalService.openTemplate(this.addChallengeModalTemplate()!);
  }

  protected handleOpenRemoveChallengeModal(groupId: string, challenge: GetPracticeChallengeGroupResponseChallenge) {
    if (!this.groupId()) {
      throw new Error("Can't resolve the groupId.");
    }

    this.modalService.openConfirm({
      title: "Remove Challenge",
      subtitle: this.groupResource.value()?.group?.name,
      bodyContent: `Remove **${challenge.name}** from this collection? (It'll still be available in the Practice Area.)`,
      onConfirm: async () => {
        await this.practiceService.challengesRemoveFromGroup({ challengeGroupId: groupId, challengeSpecIds: [challenge.id] });
        this.groupResource.reload();
      },
      confirmButtonText: "Remove",
      renderBodyAsMarkdown: true
    });
  }
}
