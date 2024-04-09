import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExternalGameHost } from '@/api/game-models';
import { fa } from "@/services/font-awesome.service";
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ExternalHostEditorComponent } from '../external-host-editor/external-host-editor.component';
import { ExternalGameService } from '@/services/external-game.service';

@Component({
  selector: 'app-external-game-host-picker',
  templateUrl: './external-game-host-picker.component.html',
  styleUrls: ['./external-game-host-picker.component.scss']
})
export class ExternalGameHostPickerComponent implements OnInit {
  @Input() gameId?: string;
  @Output() select = new EventEmitter<ExternalGameHost>();

  protected fa = fa;
  protected hosts: ExternalGameHost[] = [];
  protected selectedHostId?: string;

  constructor(
    private externalGameService: ExternalGameService,
    private modalService: ModalConfirmService) { }

  async ngOnInit(): Promise<void> {
    if (!this.gameId)
      throw new Error("Can't configure external hosts (no game ID");

    await this.loadHosts();
  }

  protected async handleAddClick(gameId: string) {
    this.modalService.openComponent({
      content: ExternalHostEditorComponent,
      context: {
        onSave: async (host) => {
          console.log("got it", host);
          await this.externalGameService.upsertExternalGameHost(host);
          await this.loadHosts();
          this.handleHostSelect(host.id);
        }
      },
    },);
  }

  protected handleEditClick(gameId: string, hostId: string) {

  }

  protected handleHostSelect(selectedHostId?: string) {
    if (!selectedHostId)
      return;

    const selectedHost = this.hosts.find(h => h.id == selectedHostId);
    if (!selectedHost)
      throw new Error(`Couldn't resolve external host ${selectedHostId}`);

    this.select.emit(selectedHost);
  }

  private async loadHosts() {
    const response = await this.externalGameService.getHosts();
    this.hosts = response?.hosts || [];
  }
}
