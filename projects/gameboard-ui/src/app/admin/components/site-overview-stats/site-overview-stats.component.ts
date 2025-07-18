import { AdminService } from '@/api/admin.service';
import { PlayerMode } from '@/api/player-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom, Subscription, timer } from 'rxjs';
import { ActiveChallengesModalComponent } from '../active-challenges-modal/active-challenges-modal.component';
import { ActiveTeamsModalComponent } from '../active-teams-modal/active-teams-modal.component';

@Component({
    selector: 'app-site-overview-stats',
    templateUrl: './site-overview-stats.component.html',
    styleUrls: ['./site-overview-stats.component.scss'],
    standalone: false
})
export class SiteOverviewStatsComponent implements OnInit, OnDestroy {
  constructor(
    private adminService: AdminService,
    private modalService: ModalConfirmService) { }

  protected activeCompetitiveChallenges = 0;
  protected activePracticeChallenges = 0;
  protected activeCompetitiveTeams = 0;
  protected registeredUsers = 0;

  private timerSub?: Subscription;

  async ngOnInit(): Promise<void> {
    this.timerSub = timer(0, 30000).subscribe(async () => {
      const stats = await firstValueFrom(this.adminService.getOverallSiteStats());

      this.activeCompetitiveChallenges = stats.activeCompetitiveChallenges;
      this.activePracticeChallenges = stats.activePracticeChallenges;
      this.activeCompetitiveTeams = stats.activeCompetitiveTeams;
      this.registeredUsers = stats.registeredUsers;
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
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
