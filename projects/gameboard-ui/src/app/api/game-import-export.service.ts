import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GameImportExportBatch, ImportedGame } from './game-import-export.models';

@Injectable({ providedIn: 'root' })
export class GameImportExportService {
  private apiUrl = inject(ApiUrlService);
  private http = inject(HttpClient);

  async export(gameIds: string[], includePracticeAreaDefaultCertificateTemplate: boolean) {
    return await firstValueFrom(
      this.http.post<GameImportExportBatch>(
        this.apiUrl.build("games/export"),
        { gameIds, includePracticeAreaDefaultCertificateTemplate }
      )
    );
  }

  async import(importPackage: File) {
    const payload: FormData = new FormData();
    payload.append("packageFile", importPackage, importPackage.name);

    return await firstValueFrom(
      this.http.post<ImportedGame[]>(
        this.apiUrl.build("games/import"),
        payload
      )
    );
  }
}
