import { Component, Input, SimpleChanges } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { firstValueFrom } from 'rxjs';
import { LocalActiveChallenge } from '@/api/challenges.models';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent {
  @Input() challenge: LocalActiveChallenge | null = null;
  @Input() autoPlay = false;

  protected isDeploying = false;
  protected fa = fa;
  protected vmUrls: { [id: string]: string } = {};

  constructor(
    private challengesService: ChallengesService,
    private routerService: RouterService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.challenge && this.challenge) {
      this.updateVmStuff(this.challenge);
    }
  }

  protected async deploy(challengeId: string) {
    if (!this.challenge) {
      throw new Error("Can't deploy from the Play component without a challenge object.");
    }

    this.isDeploying = true;
    const challenge = await firstValueFrom(this.challengesService.deploy({ id: challengeId }));

    this.isDeploying = false;
  }

  protected async undeploy(challengeId: string) {
    this.isDeploying = true;
    await firstValueFrom(this.challengesService.undeploy({ id: challengeId }));
    this.isDeploying = false;
  }

  private updateVmStuff(challenge: LocalActiveChallenge) {
    this.vmUrls = {};
    for (let vm of challenge.challengeDeployment.vms) {
      this.vmUrls[vm.id] = this.routerService.buildVmConsoleUrl(vm);
    }
  }
}
