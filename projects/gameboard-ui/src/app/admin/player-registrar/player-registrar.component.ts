// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { asyncScheduler, BehaviorSubject, combineLatest, firstValueFrom, interval, Observable, scheduled, timer } from 'rxjs';
import { debounceTime, filter, first, map, mergeAll, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Player, PlayerSearch } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '../../services/modal-confirm.service';
import { ClipboardService } from '../../utility/services/clipboard.service';
import { TeamService } from '@/api/team.service';
import { TeamAdminContextMenuTeam } from '../components/team-admin-context-menu/team-admin-context-menu.component';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ExtendTeamsModalComponent } from '../components/extend-teams-modal/extend-teams-modal.component';
import { unique } from 'projects/gameboard-ui/src/tools';
import { ToastService } from '@/utility/services/toast.service';
import { AdminEnrollTeamModalComponent } from '../components/admin-enroll-team-modal/admin-enroll-team-modal.component';

@Component({
  selector: 'app-player-registrar',
  templateUrl: './player-registrar.component.html',
  styleUrls: ['./player-registrar.component.scss'],
  providers: [UnsubscriberService]
})
export class PlayerRegistrarComponent {
  @Input() gameId?: string;
  refresh$ = new BehaviorSubject<boolean>(true);
  game!: Game;
  ctx$: Observable<{ game: Game, advanceTargetGames: Game[], players: Player[] }>;
  source: Player[] = [];
  selected: Player[] = [];
  viewed?: Player;
  viewChange$ = new BehaviorSubject<Player | undefined>(this.viewed);
  // we'd ideally constrain the max ("take") here, but this is the only place we provide player counts
  // (see https://github.com/cmu-sei/Gameboard/issues/372)
  search: PlayerSearch = { term: '', take: 0, filter: ['collapse'], sort: 'time', mode: 'competition' };
  filter = '';
  teamView = 'collapse';
  scope = '';
  mode = 'competition';
  scopes: string[] = [];
  reasons: string[] = [
    'disallowed',
    'disallowed_pii',
    'disallowed_unit',
    'disallowed_agency',
    'disallowed_explicit',
    'disallowed_innuendo',
    'disallowed_excessive_emojis',
    'not_unique'
  ];
  advanceOptions = false;
  advanceScores = false;
  autorefresh = true;

  protected fa = fa;
  protected isLoading = false;

  constructor(
    route: ActivatedRoute,
    private gameapi: GameService,
    private modalConfirmService: ModalConfirmService,
    private api: PlayerService,
    private clipboard: ClipboardService,
    private teamService: TeamService,
    private title: AppTitleService,
    private toastService: ToastService,
    private unsub: UnsubscriberService
  ) {

    const game$ = route.params.pipe(
      debounceTime(500),
      filter(p => !!this.gameId || !!p.id),
      switchMap(p => gameapi.retrieve(this.gameId || p.id)),
      tap(r => this.game = r),
      tap(r => this.teamView = r.allowTeam ? 'collapse' : ''),
      tap(r => this.title.set(`Players: ${r.name}`))
    );

    const fetch$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60000).pipe(
        filter(i => i === 0 || (this.autorefresh && this.game.session.isDuring && !this.viewed))
      )
    ]).pipe(
      tap(() => this.isLoading = true),
      debounceTime(500),
      tap(([a, b, c]) => this.search.gid = (this.gameId || a.id)),
      switchMap(() => this.api.list(this.search)),
      tap(r => this.source = r),
      tap(() => this.isLoading = false),
      tap(() => this.viewed = !this.viewed && this.search.term ? this.source.find(p => p.id === this.search.term) : this.viewed),
      tap(() => this.review())
    );

    const players$ = scheduled([
      fetch$,
      interval(1000).pipe(map(() => this.source))
    ], asyncScheduler).pipe(mergeAll());

    this.ctx$ = combineLatest([
      game$,
      players$,
      gameapi.list({ filter: ['advanceable'] })
    ]).pipe(
      map(([game, players, advanceTargetGames]) => ({ game, players, advanceTargetGames }))
    );

    this.unsub.add(
      route.queryParams.subscribe(param => {
        if (param?.term) {
          this.mode = "";
          this.teamView = "";
          this.search.filter = [this.filter];
          this.search.mode = "";
          this.search.term = param.term;
          this.refresh$.next(true);
        }
      }),

      // when a team of interest emits a session change, refresh
      this.teamService.teamSessionsChanged$.subscribe(teamIds => {
        if (this.source.some(p => teamIds.some(tid => p.teamId == tid))) {
          this.refresh$.next(true);
        }
      }));
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

  toggleMode(mode: string): void {
    this.mode = this.mode !== mode ? mode : '';
    this.search.mode = this.mode;
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
    });
  }

  protected openExtendModal(gameId: string) {
    const selectedTeamIds = unique(this.selected.map(p => p.teamId));

    this.modalConfirmService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        extensionInMinutes: 30,
        game: {
          id: gameId,
          name: this.game.name,
          isTeamGame: this.game.isTeamGame
        },
        teamIds: selectedTeamIds
      },
      modalClasses: ["modal-lg"]
    });
  }

  async unenroll(model: Player,): Promise<void> {
    this.isLoading = true;
    await firstValueFrom(this.teamService.unenroll({ teamId: model.teamId }));
    this.refresh$.next(true);
  }

  update(model: Player): void {
    this.api.update(model).pipe(first()).subscribe();
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
      .map(p => this.asCsv(p));
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
        this.clipboard.copyToClipboard(JSON.stringify(data, null, 2));
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

  async rerank(gid: string): Promise<void> {
    await firstValueFrom(this.gameapi.rerank(gid));
    () => this.refresh$.next(true);
    this.toastService.showMessage(`${this.game.name} has been **re-ranked**.`);
  }

  protected handlePlayerAddClick(game: Game) {
    this.modalConfirmService.openComponent({
      content: AdminEnrollTeamModalComponent,
      context: {
        game: game,
        onConfirm: result => {
          this.toastService.showMessage(`Enrolled **${result.name}** in the game.`);
          this.refresh$.next(true);
        }
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected handleTeamUpdated(team: TeamAdminContextMenuTeam) {
    this.refresh$.next(true);
  }
}
