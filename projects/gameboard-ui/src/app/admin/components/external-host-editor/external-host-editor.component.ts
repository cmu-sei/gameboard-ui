import { UpsertExternalGameHost } from '@/api/game-models';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-external-host-editor',
  templateUrl: './external-host-editor.component.html',
  styleUrls: ['./external-host-editor.component.scss']
})
export class ExternalHostEditorComponent implements OnInit {
  protected editHost: UpsertExternalGameHost = {
    name: "New External Game Host",
    clientUrl: "",
    hostUrl: "",
    startupEndpoint: ""
  };
  protected errors: any[] = [];
  protected hostId?: string;
  public onSave?: (host: UpsertExternalGameHost) => void | Promise<void>;
  protected title = "New External Game Host";

  ngOnInit(): void {
  }

  protected async handleConfirm(host: UpsertExternalGameHost) {
    if (this.onSave)
      await this.onSave(host);
  }
}
