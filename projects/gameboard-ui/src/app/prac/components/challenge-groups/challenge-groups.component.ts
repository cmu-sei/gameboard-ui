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

@Component({
  selector: 'app-challenge-groups',
  imports: [
    FormsModule,
    FontAwesomeModule,
    CoreModule,
    ChallengeGroupUserCardComponent,
    SpinnerComponent,
  ],
  templateUrl: './challenge-groups.component.html',
  styleUrl: './challenge-groups.component.scss'
})
export class ChallengeGroupsComponent {
  private readonly localUserId = toSignal(inject(UserService).user$.pipe(map(u => u?.id)));
  private readonly practiceService = inject(PracticeService);
  private readonly route = inject(ActivatedRoute);

  // models
  protected readonly fa = fa;
  protected readonly groupsResource = resource({
    request: () => ({
      searchTerm: this.searchTerm(),
      userId: this.localUserId()
    }),
    loader: req => this.practiceService.userChallengeGroupsGet({
      searchTerm: req.request.searchTerm,
      userId: req.request.userId
    })
  });
  protected readonly searchTerm = toSignal(this.route.queryParams.pipe(map(qp => qp.searchTerm || "")));

  protected featuredGroups = computed(() => {
    // read signals
    const featuredGroups = this.groupsResource.value()?.groups.filter(g => g.isFeatured);
    return featuredGroups;
  });

  protected unfeaturedGroups = computed(() => {
    // read signals
    const unfeaturedGroups = this.groupsResource.value()?.groups.filter(g => !g.isFeatured);
    return unfeaturedGroups;
  });
}
