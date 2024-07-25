import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { SyncStartService } from '@/services/sync-start.service';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '@/api/player.service';
import { TeamSessionResetType } from '@/api/teams.models';
import { GameService } from '@/api/game.service';
import { DateTime } from 'luxon';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ManageManualChallengeBonusesModalComponent } from '../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { NowService } from '@/services/now.service';
import { GameSessionService } from '@/services/game-session.service';
import { TeamService } from '@/api/team.service';

export interface TeamAdminContextMenuSessionResetRequest {
  team: TeamAdminContextMenuTeam;
  resetType: TeamSessionResetType;
}

export interface TeamAdminContextMenuTeam {
  id: string;
  gameId: string;
  name: string;
  isReady: boolean;
  isTeamGame: boolean;
  session: { start: DateTime | null, end: DateTime | null };
  captainPlayerId: string;
}

@Component({
  selector: 'app-team-admin-context-menu',
  templateUrl: './team-admin-context-menu.component.html',
  styleUrls: ['./team-admin-context-menu.component.scss']
})
export class TeamAdminContextMenuComponent implements OnInit {
  @Input() team?: TeamAdminContextMenuTeam;
  @Input() isLegacy = false;
  @Input() isSyncStartGame = false;

  @Output() teamUpdated = new EventEmitter<TeamAdminContextMenuTeam>();

  protected fa = fa;
  protected hasStartedSession = false;

  constructor(
    private clipboardService: ClipboardService,
    private gameService: GameService,
    private gameSessionService: GameSessionService,
    private modalService: ModalConfirmService,
    private nowService: NowService,
    private playerService: PlayerService,
    private syncStartService: SyncStartService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    if (!this.team)
      throw new Error("No player provided");

    this.hasStartedSession = !!this.team.session?.start && this.team.session.start >= this.nowService.nowToDateTime();
  }

  protected confirmReset(request: TeamAdminContextMenuSessionResetRequest) {
    // this is all really window-dressing around the "reset" operation, which we describe as an unenroll if the team's session hasn't started
    const isUnenroll = request.resetType === "unenrollAndArchiveChallenges" && this.gameSessionService.canUnenrollSessionWithDateTIme(request.team.session);
    let confirmMessage = `Are you sure you want to unenroll ${this.team?.isTeamGame ? " team" : ""} **${request.team.name}** from the game?`;
    let confirmTitle = `Unenroll ${request.team.name}?`;
    let confirmToast = `**${request.team.name}** has been unenrolled.`;

    if (!isUnenroll) {
      confirmMessage = `Are you sure you want to reset the session for ${this.team?.isTeamGame ? " team" : ""} **${request.team.name}**?`;
      confirmTitle = `Reset ${request.team.name}'s session?`;
      confirmToast = `${this.team?.isTeamGame ? "Team " : ""}**${request.team.name}**'s session has been reset.`;

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
      onConfirm: () => {
        this.resetSession(request);
        this.toastService.showMessage(confirmToast);
        this.teamUpdated.emit(request.team);
      },
      confirmButtonText: "Yes, reset",
      cancelButtonText: "No, don't reset"
    });
  }

  async copy(text: string, description: string) {
    await this.clipboardService.copy(text);
    this.toastService.showMessage(`Copied ${description} **${text}** to your clipboard.`);
  }

  async handleDeployResources(team: TeamAdminContextMenuTeam) {
    await this.gameService.deployResources(team.gameId, [team.id]);
    this.toastService.showMessage(`Resources are being deployed for **${team.name}**.`);
  }

  protected handleManageManualBonuses(team: TeamAdminContextMenuTeam) {
    this.modalService.openComponent<ManageManualChallengeBonusesModalComponent>({
      content: ManageManualChallengeBonusesModalComponent,
      context: {
        teamId: team.id,

      },
      modalClasses: ["modal-xl"]
    });
  }

  protected async handleSessionResetRequest(request: { team: { id: string }; type: TeamSessionResetType }) {
    await firstValueFrom(this.teamService.resetSession({ teamId: request.team.id, resetType: request.type }));
  }

  async handleUpdatePlayerReady(team: TeamAdminContextMenuTeam, isReady: boolean) {
    await firstValueFrom(this.syncStartService.updateTeamReadyState(team.id, { isReady }));
    this.teamUpdated.emit(team);
    this.toastService.showMessage(
      isReady ?
        `**${team.name}**'s team has been readied.` :
        `**${team.name}**'s team is no longer ready.`
    );
  }

  private async resetSession(request: TeamAdminContextMenuSessionResetRequest): Promise<void> {
    await firstValueFrom(this.teamService.resetSession({ teamId: request.team.id, resetType: request.resetType }));
  }

  async handleStartSession(team: TeamAdminContextMenuTeam) {
    await firstValueFrom(this.playerService.startPlayerId(team.captainPlayerId));
    this.teamUpdated.emit(team);
    this.toastService.showMessage(`Session started for ${team.name}`);
  }
}
