import { Component, computed, inject, model, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { PracticeService } from '@/services/practice.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { UserService } from '@/utility/user.service';
import { ChallengeGroupUserCardComponent } from '../challenge-group-user-card/challenge-group-user-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fa } from '@/services/font-awesome.service';
import { CoreModule } from '@/core/core.module';
import { ActivatedRoute } from '@angular/router';
import { GetPracticeChallengeGroupsUserDataResponseGroup } from '@/prac/models/get-practice-challenge-groups-user-data';
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';
import { ChallengeGroupCardUserStatsLineComponent } from "../challenge-group-card-user-stats-line/challenge-group-card-user-stats-line.component";

@Component({
  selector: 'app-challenge-groups',
  imports: [
    FormsModule,
    FontAwesomeModule,
    CoreModule,
    ChallengeGroupUserCardComponent,
    ChallengeGroupCardUserStatsLineComponent,
    PluralizerPipe,
    SpinnerComponent,
    ChallengeGroupCardUserStatsLineComponent
  ],
  templateUrl: './challenge-groups.component.html',
  styleUrl: './challenge-groups.component.scss'
})
export class ChallengeGroupsComponent {
  private readonly practiceService = inject(PracticeService);
  private readonly route = inject(ActivatedRoute);

  // models
  protected readonly fa = fa;
  protected readonly groupsResource = resource({
    request: () => ({
      searchTerm: this.searchTerm(),
      userId: this.localUserId()
    }),
    loader: req => this.practiceService.challengeGroupList({
      getRootOnly: true,
      searchTerm: req.request.searchTerm,
    })
  });
  protected readonly localUserId = toSignal(inject(UserService).user$.pipe(map(u => u?.id)));
  protected readonly searchTerm = toSignal(this.route.queryParams.pipe(map(qp => qp.searchTerm || "")));
  protected readonly userDataResource = resource({
    request: () => ({
      groupIds: this.groupsResource.value()?.map(g => g.id),
      userId: this.localUserId()
    }),
    loader: async req => {
      const userData = new Map<string, GetPracticeChallengeGroupsUserDataResponseGroup>();

      if (!req.request.userId || !req.request.groupIds?.length) {
        return userData;
      }

      const response = await this.practiceService.challengeGroupsGetUserData({ challengeGroupIds: req.request.groupIds, userId: req.request.userId });
      for (const group of response.groups) {
        userData.set(group.id, group);
      }

      return userData;
    }
  });

  protected featuredGroups = computed(() => {
    // read signals
    const featuredGroups = this.groupsResource.value()?.filter(g => g.isFeatured);
    return featuredGroups;
  });

  protected unfeaturedGroups = computed(() => {
    // read signals
    const unfeaturedGroups = this.groupsResource.value()?.filter(g => !g.isFeatured);
    return unfeaturedGroups;
  });
}
