import { AdminService } from '@/api/admin.service';
import { Player } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { ToastService } from '@/utility/services/toast.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-center-player-name-management',
  templateUrl: './game-center-player-name-management.component.html',
  styleUrls: ['./game-center-player-name-management.component.scss']
})
export class GameCenterPlayerNameManagementComponent implements OnInit {
  protected players: Player[] = [];
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

  async ngOnInit() {
    this.players = await firstValueFrom(this.playerService.list({ filter: ['pending'] }));
  }

  constructor(
    private adminService: AdminService,
    private playerService: PlayerService,
    private toastService: ToastService) { }

  protected async approveName(player: Player, args: { name: string, revisionReason: string }) {
    const finalName = args.name.trim();
    await this.adminService.approvePlayerName(player.id, { ...args, name: finalName });

    if (player) {
      player.pendingName = "";
      player.name = args.name;
    }

    this.toastService.showMessage(`This player's name has been changed to **${args.name}**.${args.revisionReason ? ` (reason: **${args.revisionReason}**)` : ""}`);
  }
}
