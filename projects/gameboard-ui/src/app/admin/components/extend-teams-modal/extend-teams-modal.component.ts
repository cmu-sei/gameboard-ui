import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { TeamService } from '@/api/team.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { Team } from '@/api/player-models';

interface ExtendTeamsViewModel {
  wouldEndSession: boolean;
  teams: {
    name: string;
    id: string;
    oldSessionEnd: DateTime,
    newSessionEnd: DateTime,
    wouldEndSession: boolean
  }[]
}

@Component({
  selector: 'app-extend-teams-modal',
  templateUrl: './extend-teams-modal.component.html',
  styleUrls: ['./extend-teams-modal.component.scss']
})
export class ExtendTeamsModalComponent implements OnInit {
  game?: {
    id: string;
    name: string;
    isTeamGame: boolean;
  };
  extensionInMinutes = 30;
  teamIds: string[] = [];

  protected errors: any[] = [];
  protected isWorking = false;
  protected apiTeams: Team[] = [];

  constructor(
    private modalService: ModalConfirmService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  async ngOnInit(): Promise<void> {
    if (!this.game) {
      throw new Error("Can't open the Extend modal - no game info supplied.");
    }

    if (!this.teamIds) {
      throw new Error("Can't open the Extend modal - no teams supplied.");
    }

    this.apiTeams = await firstValueFrom(this.teamService.search(this.teamIds));
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

  // private async load(teamIds: string[]) {
  //   const apiTeams = await firstValueFrom(this.teamService.search(teamIds));

  //   vm.wouldEndSession = vm.teams.some(t => t.wouldEndSession);
  //   this.viewModel = vm;
  // }
}
