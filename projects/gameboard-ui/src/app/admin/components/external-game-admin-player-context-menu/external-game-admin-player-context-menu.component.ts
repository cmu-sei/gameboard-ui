import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { firstValueFrom } from 'rxjs';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { SyncStartService } from '@/services/sync-start.service';

export interface ExternalGameAdminPlayerContextMenuData {
  id: string;
  name: string;
  isSyncStartReady: boolean;
}

@Component({
    selector: 'app-external-game-admin-player-context-menu',
    templateUrl: './external-game-admin-player-context-menu.component.html',
    styleUrls: ['./external-game-admin-player-context-menu.component.scss'],
    standalone: false
})
export class ExternalGameAdminPlayerContextMenuComponent implements OnChanges {
  @Input() player?: ExternalGameAdminPlayerContextMenuData;
  @Output() playerReadyStateChanged = new EventEmitter<{ playerId: string, isReady: boolean }>();

  protected fa = fa;

  constructor(
    private clipboardService: ClipboardService,
    private syncStartService: SyncStartService,
    private toastService: ToastService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.player)
      return;
  }

  protected copy(text: string, description: string) {
    this.clipboardService.copy(text);
    this.toastService.showMessage(`Copied ${description} **${text}** to your clipboard.`);
  }

  protected async togglePlayerReadyStatusClicked(player: ExternalGameAdminPlayerContextMenuData) {
    const isReady = !player.isSyncStartReady;
    await firstValueFrom(this.syncStartService.updatePlayerReadyState(player.id, { isReady }));
    this.toastService.showMessage(`Player **${player.name}** is now ${isReady ? "" : " not"} ready.`);
    this.playerReadyStateChanged.emit({ playerId: player.id, isReady });
  }
}
