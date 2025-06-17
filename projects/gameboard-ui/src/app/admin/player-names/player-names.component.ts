// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faSearch, faFilter, faCheck, faArrowLeft, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, timer } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Player, PlayerSearch } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { AdminService } from '@/api/admin.service';

@Component({
    selector: 'app-player-names',
    templateUrl: './player-names.component.html',
    styleUrls: ['./player-names.component.scss'],
    standalone: false
})
export class PlayerNamesComponent {
  refresh$ = new BehaviorSubject<boolean>(true);
  players$: Observable<Player[]>;
  source: Player[] = [];
  viewed: Player | undefined = undefined;
  viewChange$ = new BehaviorSubject<Player | undefined>(this.viewed);
  search: PlayerSearch = { term: '', take: 200, filter: ['collapse'], sort: 'time' };
  count = 0;
  filter = '';
  teamView = 'collapse';
  scope = '';
  scopes: string[] = [];
  reasons: string[] = ['disallowed', 'disallowed_pii', 'disallowed_unit', 'disallowed_agency', 'disallowed_explicit', 'disallowed_innuendo', 'disallowed_excessive_emojis', 'not_unique'];
  advanceOptions = false;
  advanceScores = false;
  autorefresh = true;

  faSearch = faSearch;
  faFilter = faFilter;
  faCheck = faCheck;
  faArrowLeft = faArrowLeft;
  faTimes = faTimes;
  faUndo = faUndo;

  constructor(
    private adminService: AdminService,
    private api: PlayerService) {

    this.players$ = combineLatest([
      this.refresh$,
      timer(0, 60000)
    ]).pipe(
      debounceTime(500),
      switchMap(() => this.api.list(this.search)),
      tap(r => this.source = r),
      tap(() => this.review())
    );
  }

  toggleFilter(role: string): void {
    this.filter = this.filter !== role ? role : '';
    if (!!this.filter) {
      this.search.filter = [this.teamView, this.filter];
    } else {
      this.search.filter = [this.teamView];
    }
    this.refresh$.next(true);
  }

  toggleScope(scope: string): void {
    this.scope = this.scope !== scope ? scope : '';
    this.refresh$.next(true);
  }

  async update(model: Player): Promise<void> {
    await firstValueFrom(this.api.update({
      id: model.id,
      name: model.name,
      approvedName: model.approvedName,
      nameStatus: model.nameStatus
    }));
  }

  async approveName(model: Player) {
    const requested = model.name;
    const approved = model.approvedName;

    model.approvedName = model.name;
    model.nameStatus = "";
    model.pendingName = "";
    await this.adminService.updatePlayerNameChangeRequest(model.id, { approvedName: approved, requestedName: requested, status: "" });
  }

  resetName(model: Player): void {
    model.name = model.approvedName;
    model.nameStatus = "";
    model.pendingName = "";
    this.update(model);
  }

  setStatus(model: Player, reason: string): void {
    model.name = model.approvedName;
    model.nameStatus = reason;
    model.pendingName = "";
    this.update(model);
  }

  view(u: Player): void {
    this.viewed = this.viewed !== u ? u : undefined;
    this.viewChange$.next(this.viewed);
  }

  review(): void {
    this.viewed = this.source.find(g => g.id === this.viewed?.id);
  }

  trackById(index: number, model: Player): string {
    return model.id;
  }
}
