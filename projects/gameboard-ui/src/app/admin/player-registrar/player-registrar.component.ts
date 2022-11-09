// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faTrash, faList, faSearch, faFilter, faCheck, faArrowLeft, faLongArrowAltDown, faCheckSquare, faSquare, faClipboard, faCertificate, faStar, faSyncAlt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, BehaviorSubject, combineLatest, iif, interval, Observable, of, scheduled, timer } from 'rxjs';
import { debounceTime, filter, map, mergeAll, switchMap, tap } from 'rxjs/operators';
import { BoardService } from '../../api/board.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Player, PlayerSearch, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UnityService } from '../../unity/unity.service';
import { ClipboardService } from '../../utility/clipboard.service';

@Component({
  selector: 'app-player-registrar',
  templateUrl: './player-registrar.component.html',
  styleUrls: ['./player-registrar.component.scss']
})
export class PlayerRegistrarComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  game!: Game;
  ctx$: Observable<{ game: Game, futures: Game[], players: Player[] }>;
  source: Player[] = [];
  selected: Player[] = [];
  viewed: Player | undefined = undefined;
  viewChange$ = new BehaviorSubject<Player | undefined>(this.viewed);
  search: PlayerSearch = { term: '', take: 0, filter: ['collapse'], sort: 'time' };
  filter = '';
  teamView = 'collapse';
  scope = '';
  scopes: string[] = [];
  reasons: string[] = ['disallowed', 'disallowed_pii', 'disallowed_unit', 'disallowed_agency', 'disallowed_explicit', 'disallowed_innuendo', 'disallowed_excessive_emojis', 'not_unique']
  advanceOptions = false;
  advanceScores = false;
  autorefresh = true;

  faTrash = faTrash;
  faList = faList;
  faTriangleExclamation = faTriangleExclamation;
  faSearch = faSearch;
  faFilter = faFilter;
  faCheck = faCheck;
  faArrowLeft = faArrowLeft;
  faArrowDown = faLongArrowAltDown;
  faChecked = faCheckSquare;
  faUnChecked = faSquare;
  faCopy = faClipboard;
  faStar = faStar;
  faSync = faSyncAlt;

  constructor (
    route: ActivatedRoute,
    private gameapi: GameService,
    private api: PlayerService,
    private boardApi: BoardService,
    private clipboard: ClipboardService,
    private unityService: UnityService
  ) {

    const game$ = route.params.pipe(
      debounceTime(500),
      filter(p => !!p.id),
      switchMap(p => gameapi.retrieve(p.id)),
      tap(r => this.game = r),
      tap(r => this.teamView = r.allowTeam ? 'collapse' : '')
    );

    const fetch$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60000).pipe(
        filter(i => i === 0 || (this.autorefresh && this.game.session.isDuring))
      )
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.search.gid = a.id),
      switchMap(() => this.api.list(this.search)),
      tap(r => this.source = r),
      tap(() => this.review())
    );

    const players$ = scheduled([
      fetch$,
      interval(1000).pipe(map(() => this.source))
    ], asyncScheduler).pipe(
      mergeAll(),
      tap(r => r.forEach(p => p.session = new TimeWindow(p.sessionBegin, p.sessionEnd)))
    );

    this.ctx$ = combineLatest([
      game$,
      players$,
      gameapi.list({ filter: ['future'] })
    ]).pipe(
      map(([game, players, futures]) => ({ game, players, futures }))
    );
  }

  ngOnInit(): void {
  }

  toggleFilter(role: string): void {
    this.filter = this.filter !== role ? role : '';
    this.search.filter = [this.teamView, this.filter];
    this.refresh$.next(true);
  }

  toggleTeamView(): void {
    this.teamView = !this.teamView ? 'collapse' : '';
    this.search.filter = [this.teamView, this.filter];
    this.refresh$.next(true);
  }

  toggleSort(s: string): void {
    this.search.sort = s;
    this.refresh$.next(true);
  }

  toggleScope(scope: string): void {
    this.scope = this.scope !== scope ? scope : '';
    this.refresh$.next(true);
  }

  toggleSelected(player: Player): void {
    const item = this.selected.find(p => p.id === player.id);
    if (!!item) {
      this.selected.splice(
        this.selected.indexOf(item),
        1
      );
    } else {
      this.selected.push(player);
    }
    player.checked = !item;
  }

  clearSelected(): void {
    this.source.forEach(p => p.checked = false);
    this.selected = [];
    this.advanceOptions = false;
  }

  view(u: Player): void {
    this.viewed = this.viewed !== u ? u : undefined;
    this.viewChange$.next(this.viewed);
  }

  review(): void {
    this.viewed = this.source.find(g => g.id === this.viewed?.id);
    this.selected.forEach(s => {
      const t = this.source.find(g => g.id === s.id);
      if (!!t) { t.checked = true; }
    })
  }

  delete(model: Player): void {
    this.api.delete(model.id).subscribe(() => {
      const found = this.source.find(f => f.id === model.id);
      if (found) {
        this.source.splice(
          this.source.indexOf(found),
          1
        );
      }
    });

  }

  undeploy(model: Player): void {
    this.unityService
      .undeployGame({ ctx: { gameId: model.gameId, teamId: model.teamId }, retainLocalStorage: true })
      .subscribe(result => console.log("Undeploy result: ", result));
  }

  update(model: Player): void {
    this.api.update(model).subscribe();
  }

  approveName(model: Player): void {
    model.approvedName = model.name;
    model.nameStatus = "";
    model.pendingName = "";
    this.update(model);
  }

  trackById(index: number, model: Player): string {
    return model.id;
  }

  exportCsv(list: Player[]): void {
    const a = (this.selected.length ? this.selected : list)
      .map(p => this.asCsv(p))
    const hdr = 'GameId,TeamId,TeamName,PlayerId,UserId,UserName,Rank,Score,Time,Correct,Partial,SessionBegin,SessionEnd\n';
    this.clipboard.copyToClipboard(hdr + a.join('\n'));
  }

  asCsv(p: Player): string {
    return `${p.gameId},${p.teamId},${p.approvedName.replace(',', '-')},${p.id},${p.userId},${p.userName.replace(',', '-')},${p.rank},${p.score},${p.time},${p.correctCount},${p.partialCount},${p.sessionBegin},${p.sessionEnd}`;
  }

  exportMailMeta(list: Player[]): void {
    const a = this.selected.length ? this.selected : list;
    const ids = a.map(p => p.teamId);

    this.api.getTeams(this.game.id)
      .pipe(
        map(r => r.filter(s => ids.find(i => s.id === i)))
      )
      .subscribe(data => {
        this.clipboard.copyToClipboard(JSON.stringify(data, null, 2))
      });

  }

  advanceSelected(gid: string): void {
    this.api.advanceTeams({
      gameId: this.game.id,
      nextGameId: gid,
      withScores: this.advanceScores,
      teamIds: this.selected.map(p => p.teamId)
    }).subscribe(() => this.clearSelected());
  }

  rerank(gid: string): void {
    this.gameapi.rerank(gid).subscribe(
      () => this.refresh$.next(true)
    );
  }
}
