// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { TeamChallenge } from '@/api/player-models';
import { fa } from '@/services/font-awesome.service';
import { GameCenterTeamsResultsTeam } from '../game-center.models';
import { AdminService } from '@/api/admin.service';
import { ToastService } from '@/utility/services/toast.service';
import { TeamService } from '@/api/team.service';
import { SimpleEntity } from '@/api/models';
import { UpdatePlayerNameChangeRequest } from '@/api/admin.models';

@Component({
    selector: 'app-game-center-team-detail',
    templateUrl: './game-center-team-detail.component.html',
    styleUrls: ['./game-center-team-detail.component.scss'],
    standalone: false
})
export class GameCenterTeamDetailComponent implements OnInit {
  game!: {
    id: string;
    endsOn?: DateTime;
    maxTeamSize: number;
    name: string;
  };

  team!: GameCenterTeamsResultsTeam;

  protected durationExtensionInMinutes?: number;
  protected isExtending = false;
  protected isLoading = false;
  protected isLoadingChallenges = false;
  protected fa = fa;
  protected showChallengeYaml = false;
  protected teamChallenges: TeamChallenge[] = [];
  protected reasons: string[] = [
    'disallowed',
    'disallowed_pii',
    'disallowed_unit',
    'disallowed_agency',
    'disallowed_explicit',
    'disallowed_innuendo',
    'disallowed_excessive_emojis',
    'not_unique'
  ];

  constructor(
    private adminService: AdminService,
    private modalService: ModalConfirmService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  public ngOnInit() {
    if (!this.game)
      throw new Error("Game is required");

    if (!this.team)
      throw new Error("Team is required");
  }

  protected extendByDuration(team: GameCenterTeamsResultsTeam, extensionInMinutes?: number) {
    if (!extensionInMinutes) {
      return;
    }

    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        extensionInMinutes: extensionInMinutes,
        game: this.game,
        teamIds: [team.id]
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async updateNameChangeRequest(playerId: string, overrideName: string, args: UpdatePlayerNameChangeRequest) {
    if (!args.status) {
      args.approvedName = overrideName || args.requestedName;
    }

    // tell the API
    await this.adminService.updatePlayerNameChangeRequest(playerId, args);

    // rebind
    const player = this.team.players.find(p => p.id === playerId);
    if (player) {
      player.pendingName = player.pendingName == args.approvedName ? "" : player.pendingName;
      player.name = args.approvedName;
    }

    if (this.team.captain.id === playerId)
      this.team.name = args.approvedName;

    this.toastService.showMessage(`This player's name has been changed to **${args.approvedName}**.${args.status ? ` (reason: **${args.status}**)` : ""}`);
  }

  protected handleAdminNameChangeRequest() {
    this.modalService.openConfirm({ bodyContent: "Are you sure?" });
  }

  protected async handleRemovePlayerConfirm(player: SimpleEntity) {
    this.modalService.openConfirm({
      bodyContent: `Are you sure you want to remove **${player.name}** from team **${this.team.name}**?`,
      title: "Remove Player From Team",
      subtitle: player.name,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        const removedPlayer = await this.teamService.removePlayer(player.id, this.team.id);
        this.team.players = this.team.players.filter(p => p.id !== player.id);
        this.toastService.showMessage(`Player **${removedPlayer.player.name}** was removed from the team. _(They're still registered for **${removedPlayer.game.name}**.)_`);
      }
    });
  }
}
