import { Component, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { firstValueFrom } from 'rxjs';
import { PlayerMode } from '@/api/player-models';
import { AppActiveChallengeSpec } from '@/api/admin.models';
import { AdminService } from '@/api/admin.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-active-challenges-modal',
  templateUrl: './active-challenges-modal.component.html',
  styleUrls: ['./active-challenges-modal.component.scss']
})
export class ActiveChallengesModalComponent implements OnInit {
  playerMode?: PlayerMode;

  protected errors: any[] = [];
  protected fa = fa;
  protected isPracticeMode = false;
  protected isWorking = false;
  protected specs: AppActiveChallengeSpec[] = [];

  constructor(
    private adminService: AdminService,
    private modalService: ModalConfirmService,
    private routerService: RouterService) { }

  async ngOnInit(): Promise<void> {
    if (!this.playerMode)
      throw new Error("Player mode not passed to active challenges modal.");

    await this.load(this.playerMode);
  }

  protected close() {
    this.modalService.hide();
  }

  private async load(playerMode: PlayerMode): Promise<void> {
    this.errors = [];
    this.isPracticeMode = playerMode === PlayerMode.practice;

    try {
      this.isWorking = true;
      const response = await firstValueFrom(this.adminService.getActiveChallenges(playerMode));
      this.specs = response.specs;
      this.isWorking = false;
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }
}
