import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { FilesService } from '@/services/files.service';
import { GameExportBatch, GameImportExportBatch, ImportedGame, ListGameExportBatchesResponse } from './game-import-export.models';

@Injectable({ providedIn: 'root' })
export class GameImportExportService {
  private apiUrl = inject(ApiUrlService);
  private filesService = inject(FilesService);
  private http = inject(HttpClient);

  async deleteExportBatch(exportBatchId: string) {
    await firstValueFrom(
      this.http.delete(this.apiUrl.build(`games/export-batches/${exportBatchId}`))
    );
  }

  async downloadExportBatch(exportBatchId: string): Promise<void> {
    await this.filesService.downloadFileFrom(this.apiUrl.build(`games/export-batches/${exportBatchId}`), `games-${exportBatchId}`, "zip", "application.zip");
  }

  async export(gameIds: string[], includePracticeAreaDefaultCertificateTemplate: boolean) {
    return await firstValueFrom(
      this.http.post<GameImportExportBatch>(
        this.apiUrl.build("games/export"),
        { gameIds, includePracticeAreaDefaultCertificateTemplate }
      )
    );
  }

  async listExportBatches(): Promise<GameExportBatch[]> {
    return await firstValueFrom(this.http.get<ListGameExportBatchesResponse>(this.apiUrl.build("games/export-batches")).pipe(map(r => r.exportBatches)));
  }

  async import(importPackage: File, gameIds: string[], setPublishStatus?: boolean) {
    const payload = new FormData();
    payload.set("delimitedGameIds", !gameIds?.length ? "" : gameIds!.join(","));
    payload.set("packageFile", importPackage, importPackage.name);
    payload.set("setGamesPublishStatus", (setPublishStatus === undefined ? "" : setPublishStatus).toString());

    return await firstValueFrom(
      this.http.post<ImportedGame[]>(
        this.apiUrl.build("games/import"),
        payload
      )
    );
  }

  async importPreview(importPackage: File) {
    const payload: FormData = new FormData();
    payload.append("packageFile", importPackage, importPackage.name);

    return await firstValueFrom(
      this.http.post<GameImportExportBatch>(
        this.apiUrl.build("games/import/preview"),
        payload
      )
    );
  }
}
