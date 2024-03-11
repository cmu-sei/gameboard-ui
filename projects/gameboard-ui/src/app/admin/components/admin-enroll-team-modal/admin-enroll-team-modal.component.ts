import { TeamService } from '@/api/team.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-enroll-team-modal',
  templateUrl: './admin-enroll-team-modal.component.html',
  styleUrls: ['./admin-enroll-team-modal.component.scss']
})
export class AdminEnrollTeamModalComponent implements OnInit {
  game?: {
    id: string;
    name: string;
    isTeamGame: boolean;
  };

  protected addUserId = "";
  protected errors: any[] = [];
  protected isWorking = false;

  constructor(
    private modalConfirmService: ModalConfirmService,
    private teamService: TeamService) { }

  ngOnInit(): void {
    if (!this.game)
      throw new Error("Can't resolve the game.");
  }

  protected close() {
    this.modalConfirmService.hide();
  }

  protected async handleAddClick(userId: string) {
    if (!this.game?.id)
      return;

    await firstValueFrom(this.teamService.adminEnroll({ userIds: [this.addUserId], gameId: this.game.id }));
    this.modalConfirmService.hide();
  }
}
