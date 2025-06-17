import { UpsertExternalGameHost } from '@/api/game-models';
import { ExternalGameService } from '@/services/external-game.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-external-host-editor',
    templateUrl: './external-host-editor.component.html',
    styleUrls: ['./external-host-editor.component.scss'],
    standalone: false
})
export class ExternalHostEditorComponent implements OnInit {
  protected editHost: UpsertExternalGameHost = {
    name: "New External Game Host",
    clientUrl: "",
    hostUrl: "",
    startupEndpoint: ""
  };
  protected errors: any[] = [];
  protected hasApiKey = false;
  public hostId?: string;
  public onSave?: (host: UpsertExternalGameHost) => void | Promise<void>;
  protected subtitle?: string;
  protected title = "New External Game Host";
  protected tryPingResult?: { success: boolean; response?: string };

  constructor(private externalGameService: ExternalGameService) { }

  async ngOnInit() {
    if (this.hostId) {
      const response = await this.externalGameService.getHosts();
      const host = response.hosts.find(h => h.id === this.hostId);

      if (!host)
        throw new Error(`Couldn't resolve host ${this.hostId}.`);

      this.editHost = host;
      this.hasApiKey = host.hasApiKey;
      this.subtitle = "Edit External Game Host";
      this.title = host.name;
    }
  }

  protected async handleConfirm(host: UpsertExternalGameHost) {
    if (this.onSave)
      await this.onSave(host);
  }

  protected async handleTryPing(host: UpsertExternalGameHost) {
    this.tryPingResult = await this.externalGameService.tryPingHost(host);
  }
}
