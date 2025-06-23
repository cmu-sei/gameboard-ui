import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameExportBatch } from '@/api/game-import-export.models';
import { GameImportExportService } from '@/api/game-import-export.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { CoreModule } from '@/core/core.module';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { firstValueFrom, map } from 'rxjs';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
    selector: 'app-export-batches',
    imports: [
        CommonModule,
        CoreModule,
        SpinnerComponent
    ],
    templateUrl: './export-batches.component.html',
    styleUrls: ['./export-batches.component.scss']
})
export class ExportBatchesComponent implements OnInit {
  private gameService = inject(GameService);
  private gameImportExportService = inject(GameImportExportService);
  private modalService = inject(ModalConfirmService);

  protected batches: GameExportBatch[] = [];
  protected games: Game[] = [];
  protected isLoading = false;
  @ViewChild("newExportModal") protected newExportModal?: TemplateRef<any>;
  protected selectedGameIds: string[] = [];

  ngOnInit(): Promise<void> {
    return this.load();
  }

  async handleDownload(batch: GameExportBatch) {
    await this.gameImportExportService.downloadExportBatch(batch.id);
  }

  async handleNewExportClick() {
    if (!this.newExportModal) {
      throw new Error("Couldn't resolve modal");
    }

    this.games = await firstValueFrom(this.gameService.list({ orderBy: "name" }));
    this.modalService.openTemplate(this.newExportModal);
  }

  async handleConfirmDelete(exportBatchId: string) {
    this.modalService.openConfirm({
      title: "Delete Export Package",
      subtitle: exportBatchId,
      bodyContent: "Are you sure you want to delete this exported package? You'll need to re-export the games if you want to recover it.",
      onConfirm: async () => {
        await this.gameImportExportService.deleteExportBatch(exportBatchId);
        await this.load();
      }
    });
  }

  async handleConfirmExport() {
    const batch = await this.gameImportExportService.export(this.selectedGameIds, false);
    await this.load();
    this.selectedGameIds = [];
    this.modalService.hide();
    await this.gameImportExportService.downloadExportBatch(batch.exportBatchId);
  }

  handleGameSelected(gameId: string, isSelected: boolean) {
    if (isSelected && this.selectedGameIds.indexOf(gameId) < 0) {
      this.selectedGameIds.push(gameId);
    }
    else if (!isSelected) {
      this.selectedGameIds = this.selectedGameIds.filter(gId => gId != gameId);
    }
  }

  handleSelectAllGames() {
    if (!this.selectedGameIds.length || (this.selectedGameIds.length && this.selectedGameIds.length < this.games.length)) {
      this.selectedGameIds = this.games.map(g => g.id);
    }
    else {
      this.selectedGameIds = [];
    }
  }

  private async load() {
    this.batches = await this.gameImportExportService.listExportBatches();
  }
}
