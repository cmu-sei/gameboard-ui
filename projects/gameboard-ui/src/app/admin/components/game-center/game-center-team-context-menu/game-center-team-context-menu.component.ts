// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';
import { TeamSessionResetType } from '@/api/teams.models';
import { ApiError, SimpleEntity } from '@/api/models';
import { fa } from '@/services/font-awesome.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { GameService } from '@/api/game.service';
import { SyncStartService } from '@/services/sync-start.service';
import { PlayerService } from '@/api/player.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ManageManualChallengeBonusesModalComponent } from '../../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { TeamService } from '@/api/team.service';
import { GameCenterTeamsResultsTeam } from '../game-center.models';
import { GameCenterTeamDetailComponent } from '../game-center-team-detail/game-center-team-detail.component';
import { GameSessionService } from '@/services/game-session.service';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { ApiUser } from '@/api/user-models';
import { RouterService } from '@/services/router.service';
import { PlayerMode } from '@/api/player-models';
import { TeamChallengesModalComponent } from '../../team-challenges-modal/team-challenges-modal.component';

export interface TeamSessionResetRequest {
  teamId: string;
  resetType: TeamSessionResetType;
}

@Component({
    selector: 'app-game-center-team-context-menu',
    templateUrl: './game-center-team-context-menu.component.html',
    styleUrls: ['./game-center-team-context-menu.component.scss'],
    standalone: false
})
export class GameCenterTeamContextMenuComponent {
  @Input() game?: { id: string; name: string; endsOn?: DateTime, isSyncStart: boolean; maxTeamSize: number };
  @Input() team?: GameCenterTeamsResultsTeam;
  @Output() error = new EventEmitter<string[]>();
  @Output() teamUpdated = new EventEmitter<SimpleEntity>();

  protected certificateUrl?: string;
  protected fa = fa;
  protected hasStartedSession = false;
  protected hasEndedSession = false;
  protected observeTeamUrl?: string;
  @ViewChild("addPlayerModal") addPlayerModalTemplate?: TemplateRef<any>;
  @ViewChild("copyIdsModal") copyIdsModalTemplate?: TemplateRef<any>;

  constructor(
    private clipboard: ClipboardService,
    private gameService: GameService,
    private gameSessionService: GameSessionService,
    private modalService: ModalConfirmService,
    private playerService: PlayerService,
    private routerService: RouterService,
    private syncStartService: SyncStartService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    if (!this.game?.id)
      throw new Error("No gameId provided");
    if (!this.team)
      throw new Error("No team provided");

    this.hasStartedSession = !!this.team.session.start;
    this.hasEndedSession = this.hasStartedSession && (this.team.session.timeRemainingMs || 0) <= 0;
    if (this.hasStartedSession && !this.hasEndedSession) {
      this.observeTeamUrl = this.routerService.getObserveTeamsUrl(this.game.id, this.team.id);
    }

    this.certificateUrl = this.routerService.getCertificatePrintableUrl(PlayerMode.competition, this.game.id, this.team.captain.userId);
  }

  protected confirmReset(request: TeamSessionResetRequest) {
    if (!this.team || !this.game)
      throw new Error("Game/Team are required");

    // this is all really window-dressing around the "reset" operation, which we describe as an unenroll if the team's session hasn't started
    const isUnenroll = request.resetType === "unenrollAndArchiveChallenges" && this.gameSessionService.canUnerollSessionWithEpochMs(this.team.session);
    let confirmMessage = `Are you sure you want to unenroll ${this.game.maxTeamSize > 1 ? " team" : ""} **${this.team.name}** from the game?`;
    let confirmTitle = `Unenroll ${this.team.name}?`;
    let confirmToast = `**${this.team.name}** has been unenrolled.`;

    if (!isUnenroll) {
      confirmMessage = `Are you sure you want to reset the session for ${this.game.maxTeamSize > 1 ? " team" : ""} **${this.team.name}**?`;
      confirmTitle = `Reset ${this.team.name}'s session?`;
      confirmToast = `${this.game.maxTeamSize > 1 ? "Team " : ""}**${this.team.name}**'s session has been reset.`;

      // accommodate various "types" of reset that can happen (e.g. keep challenges, don't keep challenges, destroy the universe and the unenroll)
      if (request.resetType === "preserveChallenges")
        confirmMessage += " Their challenges **won't** be archived automatically, and they'll remain enrolled in the game.";
      else if (request.resetType == "unenrollAndArchiveChallenges")
        confirmMessage += " Their challenges will be archived, and they'll be unenrolled from the game.";
    }

    this.modalService.openConfirm({
      bodyContent: confirmMessage,
      renderBodyAsMarkdown: true,
      title: confirmTitle,
      onConfirm: async () => {
        await firstValueFrom(this.teamService.resetSession(request));
        this.toastService.showMessage(confirmToast);
        this.teamUpdated.emit(this.team);
      },
      confirmButtonText: "Yes, reset",
      cancelButtonText: "No, don't reset"
    });
  }

  protected async copy(text: string, description: string) {
    await this.clipboard.copy(text);
    this.toastService.showMessage(`Copied ${description} **${text}** to your clipboard.`);
  }

  protected async handleAddPlayerClick(team: GameCenterTeamsResultsTeam) {
    if (!this.addPlayerModalTemplate) {
      throw new Error("Couldn't load the template.");
    }

    this.modalService.openTemplate(this.addPlayerModalTemplate);
  }

  protected async handleAddUserConfirm(team: GameCenterTeamsResultsTeam, user: ApiUser) {
    this.modalService.hide();
    const addedPlayer = await this.teamService.addToTeam({ teamId: team.id, userId: user.id });
    this.teamUpdated.emit(this.team);
    this.toastService.showMessage(`User **${addedPlayer.user.name}** has joined team **${team.name}**!`);
  }

  protected async handleCopyIds() {
    if (!this.copyIdsModalTemplate) {
      return;
    }

    this.modalService.openTemplate(this.copyIdsModalTemplate);
  }

  protected async handleDeployResources(team: SimpleEntity) {
    await this.gameService.deployResources(this.game!.id, [team.id]);
    this.toastService.showMessage(`Resources are being deployed for **${team.name}**.`);
  }

  protected async handleExtend(team: SimpleEntity) {
    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        game: this.game,
        teamIds: [team.id]
      },
      modalClasses: ["modal-lg"]
    });
  }

  async handleManageBonuses(team: SimpleEntity) {
    this.modalService.openComponent<ManageManualChallengeBonusesModalComponent>({
      content: ManageManualChallengeBonusesModalComponent,
      context: {
        teamId: team.id
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected async handleResetRequest(team: SimpleEntity, type: TeamSessionResetType) {
    await firstValueFrom(this.teamService.resetSession({ teamId: team.id, resetType: type }));
    this.teamUpdated.emit(team);
  }

  async handleStartSession(team: SimpleEntity) {
    try {
      await firstValueFrom(this.playerService.startPlayerId(this.team!.captain.id));
      this.teamUpdated.emit(team);
      this.toastService.showMessage(`Session started for **${team.name}**`);
    }
    catch (err: any) {
      if ("message" in err) {
        this.error.emit([(err as ApiError).message]);
      }
      else {
        this.error.emit([JSON.stringify(err)]);
      }
    }
  }

  protected handleUnenrollClick(team: SimpleEntity) {
    this.modalService.openConfirm({
      bodyContent: `Are you sure you want to unenroll **${team.name}**?`,
      renderBodyAsMarkdown: true,
      subtitle: team.name,
      title: "Unenroll " + ((this.game?.maxTeamSize || 0) > 1 ? "Team" : "Player"),
      onConfirm: async () => this.handleResetRequest(team, 'unenrollAndArchiveChallenges')
    });
  }

  async handleUpdateReady(team: SimpleEntity, isReady: boolean) {
    await firstValueFrom(this.syncStartService.updateTeamReadyState(team.id, { isReady }));
    this.teamUpdated.emit(team);

    this.toastService.showMessage(
      isReady ?
        `**${team.name}** has been readied.` :
        `**${team.name}**'s is no longer ready.`
    );
  }

  async handleView(team: GameCenterTeamsResultsTeam) {
    this.modalService.openComponent({
      content: GameCenterTeamDetailComponent,
      context: {
        team,
        game: this.game
      },
      modalClasses: ["modal-xl"]
    });
  }

  handleViewChallenges(team: GameCenterTeamsResultsTeam) {
    this.modalService.openComponent({
      content: TeamChallengesModalComponent,
      context: {
        teamId: team.id
      },
      modalClasses: ["modal-xl"]
    });
  }
}
