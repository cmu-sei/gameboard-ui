import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { SimpleEntity } from '@/api/models';
import { SyncStartService } from '@/services/sync-start.service';
import { firstValueFrom } from 'rxjs';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-deployment-admin-team-context-menu',
  templateUrl: './deployment-admin-team-context-menu.component.html',
  styleUrls: ['./deployment-admin-team-context-menu.component.scss']
})
export class DeploymentAdminTeamContextMenuComponent {
  @Input() team?: SimpleEntity;
  @Input() isReady = false;
  @Output() teamReadyStateToggled = new EventEmitter<{ teamId: string, isReady: boolean }>();

  protected fa = fa;

  constructor(
    private clipboardService: ClipboardService,
    private syncStartService: SyncStartService,
    private toastService: ToastService) { }

  protected handleCopyClicked(text: string) {
    this.clipboardService.copy(text);
    this.toastService.showMessage(`Copied team ID "${text}" to your clipboard.`);
  }

  protected async handleTeamReadyStatusToggled(team: SimpleEntity, isReady: boolean) {
    await firstValueFrom(this.syncStartService.updateTeamReadyState(team.id, { isReady: !isReady }));
    this.teamReadyStateToggled.emit({ teamId: team.id, isReady: !isReady });
  }
}
