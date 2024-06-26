import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamSessionResetType } from '@/api/teams.models';
import { GameCenterTeamsSession } from '@/api/admin.models';
import { SimpleEntity } from '@/api/models';
import { fa } from '@/services/font-awesome.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { GameService } from '@/api/game.service';
import { firstValueFrom } from 'rxjs';
import { SyncStartService } from '@/services/sync-start.service';
import { PlayerService } from '@/api/player.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ManageManualChallengeBonusesModalComponent } from '../../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { TeamService } from '@/api/team.service';

export interface TeamSessionResetRequest {
  teamId: string;
  resetType: TeamSessionResetType;
}

@Component({
  selector: 'app-game-center-team-context-menu',
  templateUrl: './game-center-team-context-menu.component.html',
  styleUrls: ['./game-center-team-context-menu.component.scss']
})
export class GameCenterTeamContextMenuComponent {
  @Input() game?: { id: string; name: string; isSyncStart: boolean; };
  @Input() team?: {
    id: string;
    name: string;
    captain: SimpleEntity;
    isReady: boolean;
    session: GameCenterTeamsSession;
  };
  @Output() teamUpdated = new EventEmitter<SimpleEntity>();

  protected fa = fa;
  protected hasStartedSession = false;


  constructor(
    private clipboard: ClipboardService,
    private gameService: GameService,
    private modalService: ModalConfirmService,
    private playerService: PlayerService,
    private syncStartService: SyncStartService,
    private teamService: TeamService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    if (!this.game?.id)
      throw new Error("No gameId provided");
    if (!this.team)
      throw new Error("No team provided");

    this.hasStartedSession = !!this.team.session.start;
  }

  async copy(text: string, description: string) {
    await this.clipboard.copy(text);
    this.toastService.showMessage(`Copied ${description} **${text}** to your clipboard.`);
  }

  async handleDeployResources(team: SimpleEntity) {
    await this.gameService.deployResources(this.game!.id, [team.id]);
    this.toastService.showMessage(`Resources are being deployed for **${team.name}**.`);
  }

  async handleManageBonuses(team: SimpleEntity) {
    this.modalService.openComponent<ManageManualChallengeBonusesModalComponent>({
      content: ManageManualChallengeBonusesModalComponent,
      context: {
        teamId: team.id
      },
    });
  }

  async handleResetRequest(team: SimpleEntity, type: TeamSessionResetType) {
    await firstValueFrom(this.teamService.resetSession({ teamId: team.id, resetType: type }));
    this.teamUpdated.emit(team);
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

  async handleStartSession(team: SimpleEntity) {
    await firstValueFrom(this.playerService.startPlayerId(this.team!.captain.id));
    this.teamUpdated.emit(team);
    this.toastService.showMessage(`Session started for **${team.name}**`);
  }
}
