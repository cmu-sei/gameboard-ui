// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, debounceTime, firstValueFrom } from 'rxjs';
import { fa } from '@/services/font-awesome.service';
import { Game, ListGamesQuery, ListGamesResponseGame, NewGame } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { GameImportExportService } from '@/api/game-import-export.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [UnsubscriberService]
})
export class DashboardComponent implements OnInit {
  private api = inject(GameService);
  private importExportService = inject(GameImportExportService);
  private localStorageService = inject(LocalStorageService);
  private modalService = inject(ModalConfirmService);
  private permissionsService = inject(UserRolePermissionsService);
  private routerService = inject(RouterService);
  private toastService = inject(ToastService);
  private unsub = inject(UnsubscriberService);

  protected errors: any[] = [];
  protected fa = fa;
  protected games: ListGamesResponseGame[] = [];
  protected isExporting = false;
  protected isLoadingGames = false;
  protected listGamesQuery: ListGamesQuery = {};
  protected typing$ = new BehaviorSubject<string>("");
  protected useTableView: boolean = false;

  constructor() {
    this.unsub.add(this.typing$.pipe(
      debounceTime(250),
    ).subscribe(async () => {
      await this.handleLoadGames();
    }));
  }

  ngOnInit(): void {
    // use local storage to keep toggle preference when returning to dashboard for continuity
    // default to false (card view) when no preference stored yet
    this.useTableView = this.localStorageService.getAs<boolean>(StorageKey.GamesAdminUseTableView, false);
    this.handleLoadGames();
  }

  async create() {
    try {
      const game = await firstValueFrom(this.api.create({ name: "New Game" } as Game));
      this.routerService.toGameCenter(game.id);
    }
    catch (err) {
      this.errors.push(err);
    }
  }

  async handleDeleteClick(game: ListGamesResponseGame): Promise<void> {
    const canDelete = this.permissionsService.can("Games_DeleteWithPlayerData");
    let message = `Are you sure you want to delete **${game.name}**?`;

    if (game.registeredTeamCount) {
      message += `\n\n${game.registeredTeamCount} players/teams have registered or played. If you continue, their data will be deleted.`;
    }

    message += "\n\n**This can't be undone**.";

    if (!game.registeredTeamCount || canDelete) {
      this.modalService.openConfirm({
        title: game.name,
        subtitle: "Delete Game",
        bodyContent: message,
        renderBodyAsMarkdown: true,
        onConfirm: async () => {
          await this.delete(game);
          this.toastService.showMessage(`Game **${game.name}** was deleted.`);
        }
      });
    } else {
      this.modalService.openConfirm({
        title: game.name,
        subtitle: "Delete Game",
        bodyContent: "This game has registered players, so you can't delete it. Contact an administrator to request deletion.",
        hideCancel: true
      });
    }
  }

  protected async handleImported() {
    await this.handleLoadGames();
  }

  private async delete(game: ListGamesResponseGame): Promise<void> {
    try {
      await this.api.deleteWithPlayerData(game.id);
      await this.handleLoadGames();
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  async clone(game: { id: string, name: string }): Promise<void> {
    this.errors = [];
    const newGameName = `${game.name} (Cloned)`;

    try {
      await this.api.clone({ gameId: game.id, name: newGameName });
      await this.handleLoadGames();
      this.toastService.showMessage(`Created the cloned game **${newGameName}**.`);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  async handleExport(gameIds: string[], includePracticeAreaCertificateTemplate = false) {
    this.isExporting = true;

    try {
      const batch = await this.importExportService.export(gameIds, includePracticeAreaCertificateTemplate);
      this.toastService.showMessage(`A package was exported! It contains **${gameIds.length}** game(s).`);
      await this.importExportService.downloadExportBatch(batch.exportBatchId);
    }
    catch (err) {
      this.errors.push(err);
    }
    finally {
      this.isExporting = false;
    }
  }

  protected async handleLoadGames() {
    this.errors = [];
    this.isLoadingGames = true;

    try {
      const response = await this.api.listAdmin(this.listGamesQuery);
      this.games = response.games;
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isLoadingGames = false;
  }

  protected handleToggleViewMode() {
    this.useTableView = !this.useTableView;
    this.localStorageService.add(StorageKey.GamesAdminUseTableView, this.useTableView);
  }
}
