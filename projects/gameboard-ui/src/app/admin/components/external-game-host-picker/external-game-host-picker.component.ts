import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExternalGameHost, UpsertExternalGameHost } from '@/api/game-models';
import { fa } from "@/services/font-awesome.service";
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ExternalHostEditorComponent } from '../external-host-editor/external-host-editor.component';
import { ExternalGameService } from '@/services/external-game.service';
import { DeleteExternalGameHostModalComponent } from '../delete-external-game-host-modal/delete-external-game-host-modal.component';

@Component({
    selector: 'app-external-game-host-picker',
    templateUrl: './external-game-host-picker.component.html',
    styleUrls: ['./external-game-host-picker.component.scss'],
    standalone: false
})
export class ExternalGameHostPickerComponent implements OnInit {
  @Input() selectedHostId?: string;
  @Output() selectedHostIdChange = new EventEmitter<string>();
  @Output() selectedHostChange = new EventEmitter<ExternalGameHost>();

  protected fa = fa;
  protected hosts: ExternalGameHost[] = [];
  protected selectedHost?: ExternalGameHost;

  constructor(
    private externalGameService: ExternalGameService,
    private modalService: ModalConfirmService) { }

  async ngOnInit(): Promise<void> {
    await this.loadHosts(this.selectedHostId);

    if (!this.selectedHostId && this.hosts.length) {
      this.selectedHostId = this.hosts[0].id;
      this.selectedHostIdChange.emit(this.selectedHostId);
      this.selectedHostChange.emit(this.hosts[0]);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedHostId && !changes.selectedHostId.firstChange) {
      this.selectedHost = this.hosts.find(h => h.id === changes.selectedHostId.currentValue);
    }
  }

  protected async handleAddClick() {
    this.modalService.openComponent({
      content: ExternalHostEditorComponent,
      context: {
        onSave: async (host) => await this.handleSave(host)
      },
    },);
  }

  protected handleDeleteClick(hostId: string) {
    this.modalService.openComponent({
      content: DeleteExternalGameHostModalComponent,
      context: {
        deleteHostId: hostId,
        deleted: async migratedToHostId => {
          await this.externalGameService.deleteHost(hostId, migratedToHostId);
          await this.loadHosts(migratedToHostId);
        }
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

  protected handleHostSelect(selectedHost?: ExternalGameHost) {
    if (!selectedHost?.id)
      return;

    this.selectedHostId = selectedHost.id;
    this.selectedHost = selectedHost;
    this.selectedHostIdChange.emit(selectedHost.id);
    this.selectedHostChange.emit(selectedHost);
  }

  private async handleSave(host: UpsertExternalGameHost) {
    await this.externalGameService.upsertExternalGameHost(host);
    await this.loadHosts(host.id);
  }

  private async loadHosts(selectedHostId?: string) {
    const response = await this.externalGameService.getHosts();
    this.hosts = response?.hosts || [];

    if (selectedHostId) {
      this.handleHostSelect(this.hosts.find(h => h.id === selectedHostId));
    }
  }
}
