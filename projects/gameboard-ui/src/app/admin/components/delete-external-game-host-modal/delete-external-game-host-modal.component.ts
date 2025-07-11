import { ExternalGameHost } from '@/api/game-models';
import { ExternalGameService } from '@/services/external-game.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-delete-external-game-host-modal',
    templateUrl: './delete-external-game-host-modal.component.html',
    styleUrls: ['./delete-external-game-host-modal.component.scss'],
    standalone: false
})
export class DeleteExternalGameHostModalComponent implements OnInit {
  deleteHostId?: string;
  deleted?: (migratedToHostId: string) => void | Promise<void>;

  protected deleteHost?: ExternalGameHost;
  protected replaceHost?: ExternalGameHost;
  protected errors: any[] = [];
  protected hosts: ExternalGameHost[] = [];

  constructor(private externalGameService: ExternalGameService) { }

  async ngOnInit(): Promise<void> {
    if (!this.deleteHostId)
      return;

    const response = await this.externalGameService.getHosts();

    if (response.hosts.length === 0)
      this.errors.push("No external hosts configured.");

    this.hosts = response.hosts.filter(h => h.id != this.deleteHostId);
    this.deleteHost = response.hosts.find(h => h.id === this.deleteHostId);
    this.replaceHost = response.hosts[0];
  }

  protected async handleConfirm(replaceHost?: ExternalGameHost) {
    this.errors = [];

    if (!replaceHost)
      this.errors.push("Couldn't resolve a replacement host.");

    if (this.deleted)
      try {
        await this.deleted(replaceHost!.id);
      }
      catch (err) {
        this.errors.push(err);
        return false;
      }

    return true;
  }
}
