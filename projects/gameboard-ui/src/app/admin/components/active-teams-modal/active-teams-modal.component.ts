// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { fa } from '@/services/font-awesome.service';
import { AppActiveTeam } from '@/api/admin.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { AdminService } from '@/api/admin.service';

@Component({
    selector: 'app-active-teams-modal',
    templateUrl: './active-teams-modal.component.html',
    styleUrls: ['./active-teams-modal.component.scss'],
    standalone: false
})
export class ActiveTeamsModalComponent implements OnInit {
  constructor(
    private modalService: ModalConfirmService,
    private admin: AdminService) { }

  protected errors: any[] = [];
  protected fa = fa;
  protected isWorking = false;

  protected matchingSearchTeams: AppActiveTeam[] = [];
  protected teams: AppActiveTeam[] = [];

  async ngOnInit(): Promise<void> {
    const response = await firstValueFrom(this.admin.getActiveTeams());
    this.teams = response.teams;
    this.matchingSearchTeams = response.teams;
  }

  protected handleSearchInput(text: string) {
    if (!text) {
      this.matchingSearchTeams = this.teams;
      return;
    }

    text = text.toLowerCase();

    this.matchingSearchTeams = this
      .teams
      .filter(t =>
        t.name.toLowerCase().indexOf(text) >= 0 ||
        t.id.toLowerCase().indexOf(text) >= 0
      );
  }

  protected close() {
    this.modalService.hide();
  }
}
