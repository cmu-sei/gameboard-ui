import { Component, OnInit } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { AppActiveTeam } from '@/api/admin.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { AdminService } from '@/api/admin.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-active-teams-modal',
  templateUrl: './active-teams-modal.component.html',
  styleUrls: ['./active-teams-modal.component.scss']
})
export class ActiveTeamsModalComponent implements OnInit {
  constructor(
    private modalService: ModalConfirmService,
    private admin: AdminService) { }

  protected errors: any[] = [];
  protected fa = fa;
  protected isWorking = false;
  protected teams: AppActiveTeam[] = [];

  async ngOnInit(): Promise<void> {
    const response = await firstValueFrom(this.admin.getActiveTeams());
    this.teams = response.teams;
  }

  protected close() {
    this.modalService.hide();
  }
}
