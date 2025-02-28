// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowLeft, faPlus, faCopy, faTrash, faEdit, faUsers, faUser, faUsersCog, faCog, faTv, faToggleOff, faToggleOn, faEyeSlash, faUndo, faGlobeAmericas, faClone, faChartBar, faCommentSlash, faLock, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { fa } from '@/services/font-awesome.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { debounceTime, switchMap, tap, mergeMap } from 'rxjs/operators';
import { Game, NewGame } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Search } from '../../api/models';
import { AppTitleService } from '@/services/app-title.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { GameImportExportService } from '@/api/game-import-export.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);
  creating$ = new Subject<NewGame>();
  created$: Observable<NewGame>;
  games$: Observable<Game[]>;
  games: Game[] = [];

  private importExportService = inject(GameImportExportService);

  preferenceKey = 'admin.dashboard.game.viewer.mode'; // key to save toggle in local storage
  tableView: boolean; // true = table, false = cards

  protected errors: any[] = [];
  protected isExporting = false;
  search: Search = { term: '' };

  fa = fa;
  faArrowLeft = faArrowLeft;
  faPlus = faPlus;
  faCopy = faCopy;
  faClone = faClone;
  faTrash = faTrash;
  faEdit = faEdit;
  faUsers = faUsersCog;
  faCog = faCog;
  faTv = faTv;
  faGamepad = faGamepad; // game lobby
  faToggleOn = faToggleOn; // on table view
  faToggleOff = faToggleOff; // on card view
  faEyeSlash = faEyeSlash; // unpublished game
  faGlobe = faGlobeAmericas; // published game
  faUser = faUser; // individual game
  faTeam = faUsers; // team game
  faUndo = faUndo; // allow reset
  faLock = faLock; // don't allow reset
  faChartBar = faChartBar; // has feedback configured
  faCommentSlash = faCommentSlash; // doesn't have feedback configured

  constructor(
    private api: GameService,
    private modalService: ModalConfirmService,
    private permissionsService: UserRolePermissionsService,
    private router: Router,
    private titleService: AppTitleService,
    private toastService: ToastService
  ) {
    this.games$ = this.refresh$.pipe(
      debounceTime(250),
      switchMap(() => api.list(this.search)),
      tap(result => this.games = result)
    );

    this.created$ = this.creating$.pipe(
      mergeMap(m => api.create(m)),
      tap(m => this.games.unshift(m)),
      tap(g => this.router.navigateByUrl(`/admin/game/${g.id}`))
    );

    // use local storage to keep toggle preference when returning to dashboard for continuity
    // default to false (card view) when no preference stored yet
    this.tableView = window.localStorage[this.preferenceKey] == 'true' ? true : false;
  }

  ngOnInit(): void {
    this.titleService.set("Admin");
  }

  create(): void {
    this.creating$.next({ name: 'New Game' } as Game);
  }

  async handleDeleteClick(game: Game): Promise<void> {
    const canDelete = this.permissionsService.can("Games_DeleteWithPlayerData");
    let message = `Are you sure you want to delete **${game.name}**?`;

    if (game.countTeams) {
      message += `\n\n${game.countTeams} players/teams have registered or played. If you continue, their data will be deleted.`;
    }

    message += "\n\n**This can't be undone**.";

    if (!game.countTeams || canDelete) {
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

  protected handleImported() {
    this.refresh$.next(true);
  }

  private async delete(game: Game): Promise<void> {
    try {
      await this.api.deleteWithPlayerData(game.id);
      this.refresh$.next(true);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  typing(e: Event): void {
    this.refresh$.next(true);
  }

  clone(game: Game): void {
    this.creating$.next({ ...game, name: `${game.name}_CLONE`, isPublished: false, isClone: true });
  }

  trackById(index: number, g: Game): string {
    return g.id;
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

  toggleViewMode() {
    this.tableView = !this.tableView;
    window.localStorage[this.preferenceKey] = this.tableView;
  }
}
