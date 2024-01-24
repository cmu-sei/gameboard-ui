import { AdminService } from '@/api/admin.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-site-overview-stats',
  templateUrl: './site-overview-stats.component.html',
  styleUrls: ['./site-overview-stats.component.scss']
})
export class SiteOverviewStatsComponent implements OnInit {
  constructor(private adminService: AdminService) { }

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
}
