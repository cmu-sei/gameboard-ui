import { Component, effect, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { PracticeService } from '@/services/practice.service';
import { ChallengeGroupUserCardComponent } from '../challenge-group-user-card/challenge-group-user-card.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { AppTitleService } from '@/services/app-title.service';
import { CoreModule } from '@/core/core.module';

@Component({
  selector: 'app-challenge-group',
  imports: [
    CoreModule,
    ChallengeGroupUserCardComponent,
    SpinnerComponent
  ],
  templateUrl: './challenge-group.component.html',
  styleUrl: './challenge-group.component.scss'
})
export class ChallengeGroupComponent {
  private readonly practiceService = inject(PracticeService);
  private readonly route = inject(ActivatedRoute);
  private readonly groupId = toSignal(this.route.paramMap.pipe(map(params => params.get("id"))));
  private readonly title = inject(AppTitleService);

  protected groupResource = resource({
    request: () => ({ groupId: this.groupId() }),
    loader: async req => {
      if (!req.request.groupId) {
        return null;
      }

      const response = await this.practiceService.userChallengeGroupsGet({ groupId: req.request.groupId });
      if (response?.groups.length === 1) {
        return response.groups[0];
      }

      return null;
    }
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
