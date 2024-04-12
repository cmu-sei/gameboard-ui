import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExternalGameHost, UpsertExternalGameHost } from '@/api/game-models';
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
  @Input() selectedHostId?: string;
  @Output() select = new EventEmitter<ExternalGameHost>();

  protected fa = fa;
  protected hosts: ExternalGameHost[] = [];

  constructor(
    private externalGameService: ExternalGameService,
    private modalService: ModalConfirmService) { }

  async ngOnInit(): Promise<void> {
    await this.loadHosts(this.selectedHostId);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.hosts.length)
  //     return;

  //   if (!this.selectedHostId) {
  //     this.selectedHost = this.hosts.find(h => h.id === this.selectedHostId);
  //     return;
  //   }

  //   this.selectedHost = this.hosts[0];
  //   console.log("selected host became", this.selectedHost);
  // }

  protected async handleAddClick() {
    this.modalService.openComponent({
      content: ExternalHostEditorComponent,
      context: {
        onSave: async (host) => await this.handleSave(host)
      },
    },);
  }

  protected handleDeleteClick(hostId: string) {
    const host = this.hosts.find(h => h.id == hostId);
    if (!host)
      return;

    this.modalService.openConfirm({
      title: `Delete ${host.name}?`,
      bodyContent: `Are you sure you want to delete the host **${host.name}**? This can't be undone.`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        await this.externalGameService.deleteHost(hostId);
        await this.loadHosts();
      },
    });
  }

  protected handleEditClick(hostId: string) {
    this.modalService.openComponent({
      content: ExternalHostEditorComponent,
      context: {
        hostId: hostId,
        onSave: async (host) => await this.handleSave(host)
      }
    });
  }

  protected handleHostSelect(selectedHostId?: string) {
    if (!selectedHostId)
      return;

    const selectedHost = this.hosts.find(h => h.id == selectedHostId);
    if (!selectedHost)
      throw new Error(`Couldn't resolve external host ${selectedHostId}`);

    this.selectedHostId = selectedHostId;
    this.select.emit(selectedHost);
  }

  private async handleSave(host: UpsertExternalGameHost) {
    console.log("hi so this one is selected now", this.selectedHostId);
    await this.externalGameService.upsertExternalGameHost(host);
    await this.loadHosts(host.id);
    console.log("and this one is selected after", this.selectedHostId);
  }

  private async loadHosts(selectedHostId?: string) {
    const response = await this.externalGameService.getHosts();
    this.hosts = response?.hosts || [];
    this.handleHostSelect(selectedHostId);
  }
}
