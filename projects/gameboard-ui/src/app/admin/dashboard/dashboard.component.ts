// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faPlus, faCopy, faTrash, faEdit, faUsers, faUser, faUsersCog, faCog, faTv, faToggleOff, faToggleOn, faEyeSlash, faUndo, faGlobeAmericas, faClone, faChartBar, faCommentSlash, faLock, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { fa } from '@/services/font-awesome.service';
import { BehaviorSubject, Subject, Observable, firstValueFrom } from 'rxjs';
import { debounceTime, switchMap, tap, mergeMap } from 'rxjs/operators';
import { Game, NewGame } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Search } from '../../api/models';
import { AppTitleService } from '@/services/app-title.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { GameYamlImportModalComponent } from '../components/game-yaml-import-modal/game-yaml-import-modal.component';
import { ToastService } from '@/utility/services/toast.service';
import { GameImportExportService } from '@/api/game-import-export.service';

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
  hot!: Game | null;

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
    private router: Router,
    private route: ActivatedRoute,
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

  async delete(game: Game): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(game.id));
      this.remove(game);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  remove(game: Game): void {
    const index = this.games.indexOf(game);
    this.games.splice(index, 1);
  }

  select(game: Game): void {
    this.router.navigate(['../designer', game.id], { relativeTo: this.route });
  }

  typing(e: Event): void {
    this.refresh$.next(true);
  }

  clone(game: Game): void {
    this.creating$.next({ ...game, name: `${game.name}_CLONE`, isPublished: false, isClone: true });
  }

  // don't stringify parsed feedbackTemplate object, just string property
  replacer(key: any, value: any) {
    if (key == "id") return undefined;
    if (key == "feedbackTemplate") return undefined;
    else return value;
  }

  trackById(index: number, g: Game): string {
    return g.id;
  }

  async handleExport(gameIds: string[], includePracticeAreaCertificateTemplate = false) {
    this.isExporting = true;

    try {
      await this.importExportService.export(gameIds, includePracticeAreaCertificateTemplate);
      this.toastService.showMessage(`A package was exported! It contains **${gameIds.length}** game(s).`);
    }
    catch (err) {
      this.errors.push(err);
    }
    finally {
      this.isExporting = false;
    }
  }

  async handlePackageUpload(files: File[]): Promise<void> {
    this.errors = [];

    if (files.length != 1) {
      this.errors.push("Please specify a Gameboard package to upload.");
    }

    const result = await this.importExportService.import(files[0]);
    if (result.length == 0) {
      this.errors.push("No games imported.");
    }
    else {
      this.toastService.showMessage(`Imported **${result.length}** game(s). Let's play!`);
    }

  }

  toggleViewMode() {
    this.tableView = !this.tableView;
    window.localStorage[this.preferenceKey] = this.tableView;
  }
}
