// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, output, TemplateRef, ViewChild } from '@angular/core';
import { GameImportExportService } from '@/api/game-import-export.service';
import { CoreModule } from '@/core/core.module';
import { ErrorDivComponent } from "@/standalone/core/components/error-div/error-div.component";
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ToastService } from '@/utility/services/toast.service';
import { GameImportExportBatch } from '@/api/game-import-export.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { unique } from 'projects/gameboard-ui/src/tools/tools';

@Component({
    selector: 'app-package-upload',
    templateUrl: './package-upload.component.html',
    styleUrl: './package-upload.component.scss',
    imports: [
        CoreModule,
        ErrorDivComponent,
        SpinnerComponent
    ]
})
export class PackageUploadComponent {
  imported = output();

  private importExportService = inject(GameImportExportService);
  private modalConfirmService = inject(ModalConfirmService);
  private toastService = inject(ToastService);

  protected errors: any[] = [];
  protected file?: File;
  protected isLoading = false;
  protected package?: GameImportExportBatch;
  @ViewChild("previewImportTemplate") previewImportTemplate?: TemplateRef<any>;
  protected selectedGameIds: string[] = [];
  protected setPublishStatus?: boolean;

  protected handleCancel() {
    this.errors = [];
    this.file = undefined;
    this.selectedGameIds = [];
  }

  protected async handleImport() {
    this.errors = [];

    if (!this.file) {
      return;
    }

    const result = await this.importExportService.import(this.file, this.selectedGameIds, this.setPublishStatus);
    this.toastService.showMessage(`Imported **${result.length}** game(s). Let's play!`);
    this.handleCancel();

    this.imported.emit();
  }

  async handlePackageUpload(files: File[]): Promise<void> {
    this.errors = [];
    this.selectedGameIds = [];

    if (!this.previewImportTemplate) {
      this.errors.push("Couldn't resolve the import preview modal.");
      return;
    }

    this.isLoading = true;
    this.modalConfirmService.openTemplate(this.previewImportTemplate);

    if (files.length != 1) {
      this.errors.push("Please specify a Gameboard package to upload.");
      return;
    }

    try {
      this.package = await this.importExportService.importPreview(files[0]);
      this.file = files[0];
    }
    catch (err) {
      this.errors.push(err);
      return;
    }

    this.isLoading = false;
  }

  protected handleSelect(event: Event, gameId: string) {
    if ((event as any).target.checked) {
      this.selectedGameIds = unique([...this.selectedGameIds, gameId]);
    }
    else {
      this.selectedGameIds = [...this.selectedGameIds.filter(gId => gId !== gameId)];
    }
  }

  protected handleToggleSelect(gameId: string) {
    if (this.selectedGameIds.find(gId => gId === gameId)) {
      this.selectedGameIds = [...this.selectedGameIds.filter(gId => gId !== gameId)];
    } else {
      this.selectedGameIds = [...this.selectedGameIds, gameId];
    }
  }

  protected handleSelectAll(event: Event) {
    if (!this.package) {
      return;
    }

    if ((event.target as any)!.checked) {
      this.selectedGameIds = this.package.games.map(g => g.id);
    } else {
      this.selectedGameIds = [];
    }
  }
}
