import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from "@/core/core.module";
import { TeamService } from '@/api/team.service';
import { GetTeamChallengeSpecsStatusesResponse } from '@/api/teams.models';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ErrorDivComponent } from "../../../standalone/core/components/error-div/error-div.component";
import { ToSupportCodePipe } from '@/standalone/core/pipes/to-support-code.pipe';
import { ChallengesService } from '@/api/challenges.service';
import { firstValueFrom, Subject } from 'rxjs';
import { fa } from '@/services/font-awesome.service';

@Component({
  selector: 'app-team-challenges-modal',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    ErrorDivComponent,
    SpinnerComponent,
    ToSupportCodePipe
  ],
  templateUrl: './team-challenges-modal.component.html',
  styleUrls: ['./team-challenges-modal.component.scss']
})
export class TeamChallengesModalComponent implements OnInit {
  private challengeService = inject(ChallengesService);
  private teamService = inject(TeamService);
  teamId!: string;

  protected ctx?: GetTeamChallengeSpecsStatusesResponse;
  protected errors: any[] = [];
  protected fa = fa;
  protected isWorking = false;
  protected isUnlocked = false;
  protected unlockAdminCode = "";
  protected unlockAdminCodeInput$ = new Subject<string>();

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async handleDeployClick(challengeId?: string): Promise<void> {
    if (!challengeId) {
      this.errors.push("No challenge instance.");
    }

    await this.doChallengeStuff(() => firstValueFrom(this.challengeService.deploy({ id: challengeId! })));
  }

  async handleUneployClick(challengeId?: string): Promise<void> {
    if (!challengeId) {
      this.errors.push("No challenge instance.");
    }

    await this.doChallengeStuff(() => firstValueFrom(this.challengeService.undeploy({ id: challengeId! })));
  }

  async handlePurgeClick(challengeId?: string) {
    if (!challengeId) {
      this.errors.push("No challenge instance.");
    }

    await this.doChallengeStuff(() => this.challengeService.delete(challengeId!));
  }

  async handleStartClick(challengeSpecId: string): Promise<void> {
    await this.doChallengeStuff(() => this.challengeService.start({ teamId: this.teamId, challengeSpecId }));
  }

  handleUnlockAdminCodeInput(value: string) {
    this.isUnlocked = value.toLowerCase() === this.unlockAdminCode.toLowerCase();
  }

  private async doChallengeStuff<T>(challengeTask: () => Promise<T>) {
    try {
      this.isWorking = true;
      await challengeTask();
    }
    catch (err) {
      this.errors.push(err);
    }
    finally {
      this.isWorking = false;
    }

    await this.load();
  }

  private async load(): Promise<void> {
    this.errors = [];
    if (!this.teamId) {
      throw new Error("TeamId is required.");
    }

    this.ctx = await this.teamService.getChallengeSpecStatuses(this.teamId);
    this.unlockAdminCode = this.teamId.substring(0, 6);
  }
}
