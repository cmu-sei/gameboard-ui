import { AdminService } from '@/api/admin.service';
import { PlayerMode } from '@/api/player-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActiveChallengesModalComponent } from '../active-challenges-modal/active-challenges-modal.component';
import { ActiveTeamsModalComponent } from '../active-teams-modal/active-teams-modal.component';

@Component({
  selector: 'app-site-overview-stats',
  templateUrl: './site-overview-stats.component.html',
  styleUrls: ['./site-overview-stats.component.scss']
})
export class SiteOverviewStatsComponent implements OnInit {
  constructor(
    private adminService: AdminService,
    private modalService: ModalConfirmService) { }

  protected activeCompetitiveChallenges = 0;
  protected activePracticeChallenges = 0;
  protected activeCompetitiveTeams = 0;
  protected registeredUsers = 0;

  async ngOnInit(): Promise<void> {
    const stats = await firstValueFrom(this.adminService.getOverallSiteStats());

    this.activeCompetitiveChallenges = stats.activeCompetitiveChallenges;
    this.activePracticeChallenges = stats.activePracticeChallenges;
    this.activeCompetitiveTeams = stats.activeCompetitiveTeams;
    this.registeredUsers = stats.registeredUsers;
  }

  protected showChallengesModal(playerMode: "competitive" | "practice") {
    this.modalService.openComponent({
      content: ActiveChallengesModalComponent,
      context: {
        playerMode: playerMode == "practice" ? PlayerMode.practice : PlayerMode.competition
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected showTeamsModal() {
    this.modalService.openComponent({
      content: ActiveTeamsModalComponent,
      context: {},
      modalClasses: ["modal-xl"]
    });
  }
}
