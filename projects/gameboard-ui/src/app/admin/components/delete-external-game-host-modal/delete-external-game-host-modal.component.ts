import { ExternalGameHost } from '@/api/game-models';
import { ExternalGameService } from '@/services/external-game.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delete-external-game-host-modal',
  templateUrl: './delete-external-game-host-modal.component.html',
  styleUrls: ['./delete-external-game-host-modal.component.scss']
})
export class DeleteExternalGameHostModalComponent implements OnInit {
  deleteHostId?: string;
  deleted?: (migratedToHostId: string) => void | Promise<void>;

  protected deleteHost?: ExternalGameHost;
  protected errors: any[] = [];
  protected hosts: ExternalGameHost[] = [];

  constructor(private externalGameService: ExternalGameService) { }

  async ngOnInit(): Promise<void> {
    if (!this.deleteHostId)
      return;

    const response = await this.externalGameService.getHosts();
    this.hosts = response.hosts.filter(h => h.id != this.deleteHostId);
    this.deleteHost = response.hosts.find(h => h.id === this.deleteHostId);
  }

  protected async handleConfirm(hostId: string) {
    this.errors = [];

    if (this.deleted)
      try {
        await this.deleted(hostId);
      }
      catch (err) {
        this.errors.push(err);
        return false;
      }

    return true;
  }
}
