import { ChallengeSolutionGuide } from '@/api/challenges.models';
import { ChallengesService } from '@/api/challenges.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { fa } from '@/services/font-awesome.service';

@Component({
    selector: 'app-challenge-solution-guide',
    styleUrls: ["./challenge-solution-guide.component.scss"],
    templateUrl: './challenge-solution-guide.component.html',
    standalone: false
})
export class ChallengeSolutionGuideComponent implements OnChanges {
  @Input() challengeId?: string;

  protected guide: ChallengeSolutionGuide | null = null;
  protected fa = fa;

  constructor(private challengeService: ChallengesService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.challengeId) {
      this.guide = await firstValueFrom(this.challengeService.getSolutionGuide(this.challengeId));
    }
  }
}
