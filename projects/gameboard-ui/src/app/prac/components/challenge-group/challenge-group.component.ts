import { Component, computed, effect, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { PracticeService } from '@/services/practice.service';
import { ChallengeGroupUserCardComponent } from '../challenge-group-user-card/challenge-group-user-card.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { AppTitleService } from '@/services/app-title.service';
import { CoreModule } from '@/core/core.module';
import { UserService } from '@/utility/user.service';
import { GetPracticeChallengeGroupsUserDataChallengeAttempt, GetPracticeChallengeGroupsUserDataResponseGroup } from '@/prac/models/get-practice-challenge-groups-user-data';
import { ToPracticeCertificateLinkPipe } from '@/prac/pipes/to-practice-certificate-link.pipe';
import { ChallengeGroupCardUserStatsLineComponent } from "../challenge-group-card-user-stats-line/challenge-group-card-user-stats-line.component";

@Component({
  selector: 'app-challenge-group',
  imports: [
    CoreModule,
    ChallengeGroupUserCardComponent,
    SpinnerComponent,
    ToPracticeCertificateLinkPipe,
    ChallengeGroupCardUserStatsLineComponent
  ],
  templateUrl: './challenge-group.component.html',
  styleUrl: './challenge-group.component.scss'
})
export class ChallengeGroupComponent {
  private readonly localUser = inject(UserService);
  private readonly practiceService = inject(PracticeService);
  private readonly route = inject(ActivatedRoute);
  private readonly groupId = toSignal(this.route.paramMap.pipe(map(params => params.get("id"))));
  private readonly title = inject(AppTitleService);

  protected readonly childGroupsResource = resource({
    request: () => ({ groupId: this.groupId() }),
    loader: async req => {
      if (!req.request.groupId) {
        return [];
      }

      return await this.practiceService.challengeGroupList({ parentGroupId: req.request.groupId });
    }
  });

  protected readonly groupResource = resource({
    request: () => ({ groupId: this.groupId() }),
    loader: async req => {
      if (!req.request.groupId) {
        return null;
      }

      const response = await this.practiceService.challengeGroupGet(req.request.groupId);
      return response.group;
    }
  });

  protected readonly userDataResource = resource({
    request: () => ({ group: this.groupResource.value(), userId: this.localUser.user$.value?.id }),
    loader: async req => {
      if (!req.request.group || !req.request.userId) {
        return null;
      }

      const groupIds = [req.request.group.id, ...req.request.group.childGroups.map(g => g.id)];
      const response = await this.practiceService.challengeGroupsGetUserData({ userId: req.request.userId, challengeGroupIds: groupIds });
      return response.groups
    }
  });

  protected readonly userChallengeData = computed(() => {
    const challengeData = new Map<string, GetPracticeChallengeGroupsUserDataChallengeAttempt | undefined>();
    const userData = this.userDataResource.value();

    if (!userData) {
      return challengeData;
    }

    for (const challengeGroup of userData) {
      for (const challenge of challengeGroup.challenges) {
        challengeData.set(challenge.id, challenge.bestAttempt);
      }
    }

    return challengeData;
  });

  protected readonly userChallengeGroupData = computed(() => {
    const userData = this.userDataResource.value();
    const challengeGroupData = new Map<string, GetPracticeChallengeGroupsUserDataResponseGroup>();

    if (!userData) {
      return challengeGroupData;
    }


    for (const group of userData) {
      challengeGroupData.set(group.id, group);
    }

    return challengeGroupData;
  });

  constructor() {
    effect(() => {
      // read signals
      const group = this.groupResource.value();
      if (group) {
        this.title.set(group.name);
      }
    });
  }
}
