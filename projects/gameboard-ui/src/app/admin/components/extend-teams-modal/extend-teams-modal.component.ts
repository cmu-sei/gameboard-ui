import { AdminService } from '@/api/admin.service';
import { Team } from '@/api/player-models';
import { TeamService } from '@/api/team.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-extend-teams-modal',
  templateUrl: './extend-teams-modal.component.html',
  styleUrls: ['./extend-teams-modal.component.scss']
})
export class ExtendTeamsModalComponent implements OnInit {
  extensionInMinutes = 30;
  game?: {
    id: string,
    name: string,
    isTeamGame: boolean
  };
  teamIds: string[] = [];

  protected errors: any[] = [];
  protected isWorking = false;
  protected teams: Team[] = [];

  constructor(
    private modalService: ModalConfirmService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  async ngOnInit(): Promise<void> {
    this.teams = await firstValueFrom(this.teamService.search(this.teamIds));

    if (!this.game) {
      throw new Error("Can't open the Extend modal - no game info supplied.");
    }
  }

  async extend(teamIds: string[], extensionDurationInMinutes: number) {
    this.isWorking = true;

    try {
      const result = await firstValueFrom(this.teamService.adminExtendSession({ teamIds, extensionDurationInMinutes }));
      this.modalService.hide();
      this.toastService.showMessage(`Extended sessions by ${extensionDurationInMinutes} minutes for ${result.teams.length} teams.`);
    }
    catch (err: any) {
      this.errors.push(err);
    }

    this.isWorking = false;
  }

  protected close() {
    this.modalService.hide();
  }
}
