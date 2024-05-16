import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player } from '@/api/player-models';
import { fa } from '@/services/font-awesome.service';
import { GameSessionService } from '@/services/game-session.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { SyncStartService } from '@/services/sync-start.service';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '@/api/player.service';
import { TeamSessionResetType } from '@/api/teams.models';
import { GameService } from '@/api/game.service';

export interface TeamAdminContextMenuSessionResetRequest {
  player: Player;
  resetType: TeamSessionResetType;
}

@Component({
  selector: 'app-team-admin-context-menu',
  templateUrl: './team-admin-context-menu.component.html',
  styleUrls: ['./team-admin-context-menu.component.scss']
})
export class TeamAdminContextMenuComponent implements OnInit {
  @Input() player!: Player;
  @Input() hasStartedSession = false;
  @Input() isViewing = false;
  @Input() isSyncStartGame = false;

  @Output() bonusManageRequest = new EventEmitter<Player>();
  @Output() playerChange = new EventEmitter<Player>();
  @Output() sessionResetRequest = new EventEmitter<TeamAdminContextMenuSessionResetRequest>();
  @Output() viewRequest = new EventEmitter<Player>();

  protected fa = fa;
  protected isResettingSession = false;

  constructor(
    private clipboardService: ClipboardService,
    private gameService: GameService,
    private gameSessionService: GameSessionService,
    private playerService: PlayerService,
    private syncStartService: SyncStartService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    if (!this.player)
      throw new Error("No player provided");

    this.hasStartedSession = this.player?.sessionBegin?.getFullYear() !== 0;
    this.isResettingSession = !this.gameSessionService.canUnenroll(this.player);
  }

  async copy(text: string, description: string) {
    await this.clipboardService.copy(text);
    this.toastService.showMessage(`Copied ${description} **${text}** to your clipboard.`);
  }

  async handleDeployResources(player: Player) {
    await this.gameService.deployResources(player.gameId, [player.teamId]);
    this.toastService.showMessage(`Resources are being deployed for **${player.approvedName}**.`);
  }

  async handleUpdatePlayerReady(player: Player, isReady: boolean) {
    player.isReady = isReady;
    await firstValueFrom(this.syncStartService.updateTeamReadyState(player.teamId, { isReady }));
    this.playerChange.emit(player);
    this.toastService.showMessage(
      player.isReady ?
        `**${player.approvedName}**'s team has been readied.` :
        `**${player.approvedName}**'s team is no longer ready.`
    );
  }

  async handleStartSession(player: Player) {
    await firstValueFrom(this.playerService.start(player));
    this.playerChange.emit(player);
    this.toastService.showMessage(`Session started for ${player.approvedName}`);
  }
}
