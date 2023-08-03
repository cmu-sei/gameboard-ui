import { ApiTimeWindowState } from '@/core/models/api-time-window';
import { Component, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
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
export class PlayComponent implements OnInit {
  @Input() challenge?: LocalActiveChallenge;
  @Input() autoPlay = false;

  protected isPlayAllowed = false;
  protected isDeploying = false;
  protected fa = fa;
  protected vmUrls: { [id: string]: string } = {};

  constructor(
    private challengesService: ChallengesService,
    private routerService: RouterService) { }

  ngOnInit(): void {
    if (!this.challenge) {
      throw new Error("Can't use the Play component without a challenge input.");
    }

    this.isPlayAllowed = this.challenge.session.state == ApiTimeWindowState.During;
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
