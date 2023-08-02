import { LocalActiveChallenge, VmState } from '@/api/board-models';
import { ApiTimeWindowState } from '@/core/models/api-time-window';
import { Component, Input, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ChallengesService } from '@/api/challenges.service';
import { firstValueFrom } from 'rxjs';

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

  protected async deploy(challengeId: string) {
    if (!this.challenge) {
      throw new Error("Can't deploy from the Play component without a challenge object.");
    }

    this.isDeploying = true;
    const challenge = await firstValueFrom(this.challengesService.deploy({ id: challengeId }));

    this.vmUrls = {};
    for (let vm of this.challenge.challengeDeployment.vms) {
      this.vmUrls[vm.id] = this.routerService.buildVmConsoleUrl(vm);
    }

    console.log("this.vm", this.vmUrls);

    this.isDeploying = false;
  }

  protected async undeploy(challengeId: string) {
    this.isDeploying = true;
    await firstValueFrom(this.challengesService.undeploy({ id: challengeId }));
    this.isDeploying = false;
  }
}
