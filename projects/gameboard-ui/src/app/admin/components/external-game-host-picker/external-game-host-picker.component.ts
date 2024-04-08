import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExternalGameHost } from '@/api/game-models';
import { fa } from "@/services/font-awesome.service";

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

  ngOnInit(): void {
    if (!this.gameId)
      throw new Error("Can't configure external hosts (no game ID");
  }

  protected handleAddClick(gameId: string) {

  }

  protected handleEditClick(gameId: string, hostId: string) {

  }

  protected handleHostSelect(selectedHostId: string) {
    const selectedHost = this.hosts.find(h => h.id == selectedHostId);
    if (!selectedHost)
      throw new Error(`Couldn't resolve external host ${selectedHostId}`);

    this.select.emit(selectedHost);
  }
}
