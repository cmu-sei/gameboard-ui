import { Component, OnInit } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { TeamService } from '@/api/team.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { Team } from '@/api/player-models';

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
  onExtend?: () => Promise<void> | Observable<void>;
  teamIds: string[] = [];

  protected errors: any[] = [];
  protected ineligibleTeamIds: string[] = [];
  protected isWorking = false;
  protected modalTitle = "Extend Sessions";
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

    this.apiTeams = await firstValueFrom(this.teamService.search(this.teamIds).pipe(
      map(teams => teams.filter(t => t.sessionEnd.getFullYear() !== 0))
    ));
    this.ineligibleTeamIds = this.teamIds.filter(tId => this.apiTeams.map(t => t.teamId).indexOf(tId) < 0);
    this.modalTitle = this.apiTeams.length === 1 ? `Extend Session: ${this.apiTeams[0].approvedName}` : "Extend Sessions";
  }

  async extend(extensionDurationInMinutes: number) {
    this.isWorking = true;

    try {
      const teamIds = this.apiTeams.map(t => t.teamId);
      const result = await firstValueFrom(this.teamService.adminExtendSession({ teamIds, extensionDurationInMinutes }));

      if (this.onExtend)
        await this.onExtend();

      this.close();
      this.toastService.showMessage(`Extended sessions by **${extensionDurationInMinutes}** minutes for **${result.teams.length}** teams.`);
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
