// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faBolt, faExclamationTriangle, faTrash, faTv } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, BehaviorSubject, merge, Observable, of, scheduled, Subject, Subscription, timer } from 'rxjs';
import { catchError, debounceTime, filter, map, mergeAll, switchMap, tap } from 'rxjs/operators';
import { BoardPlayer, BoardSpec, Challenge, NewChallenge, VmState } from '../../../api/board-models';
import { BoardService } from '../../../api/board.service';
import { ApiUser } from '../../../api/user-models';
import { ConfigService } from '../../../utility/config.service';
import { HubState, NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../utility/user.service';
import { GameboardPerformanceSummaryViewModel } from '../../components/gameboard-performance-summary/gameboard-performance-summary.component';

@Component({
  selector: 'app-gameboard-page',
  templateUrl: './gameboard-page.component.html',
  styleUrls: ['./gameboard-page.component.scss']
})
export class GameboardPageComponent implements OnDestroy {
  refresh$ = new Subject<string>();
  ctx!: BoardPlayer;
  hoveredItem: BoardSpec | null = null;
  selected!: BoardSpec;
  selecting$ = new Subject<BoardSpec>();
  launching$ = new Subject<BoardSpec>();
  specs$: Observable<BoardSpec>;
  fetch$: Subscription;

  etd$!: Observable<number>;
  errors: any[] = [];
  faTv = faTv;
  faTrash = faTrash;
  faBolt = faBolt;
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  deploying = false;
  variant = 0;
  user$: Observable<ApiUser | null>;
  hubstate$: Observable<HubState>;
  hubsub: Subscription;
  cid = '';
  performanceSummaryViewModel$ = new BehaviorSubject<GameboardPerformanceSummaryViewModel | undefined>(undefined);

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private api: BoardService,
    private config: ConfigService,
    private hub: NotificationService,
    usersvc: UserService
  ) {

    this.user$ = usersvc.user$;
    this.hubstate$ = hub.state$;
    this.hubsub = hub.challengeEvents.subscribe(ev => this.syncOne(ev.model as Challenge));

    this.fetch$ = merge(
      route.params.pipe(
        tap(p => this.cid = p.cid),
        map(p => p.playerId)
      ),
      this.refresh$
    ).pipe(
      filter(id => !!id),
      debounceTime(300),
      switchMap(id => api.load(id).pipe(
        catchError(err => of({} as BoardPlayer))
      )),
      tap(b => {
        this.ctx = b;
        this.performanceSummaryViewModel$.next({
          player: {
            id: b.id,
            teamId: b.teamId,
            session: b.session,
            scoring: {
              rank: b.rank,
              score: b.score,
              partialCount: b.partialCount,
              correctCount: b.correctCount
            }
          },
          game: {
            isPracticeMode: b.game.isPracticeMode
          }
        });
      }),
      tap(b => this.startHub(b)),
      tap(b => this.reselect())
    ).subscribe();

    const launched$ = this.launching$.pipe(
      switchMap(s => api.launch({ playerId: this.ctx.id, specId: s.id, variant: this.variant })),
      catchError(err => {
        this.errors.push(err);
        return of(null as unknown as Challenge);
      }),
      tap(c => this.deploying = false),
      filter(c => !!c),
      map(c => this.syncOne(c))
    );

    const selected$ = this.selecting$.pipe(
      // If s.instance does not exist, fetch; otherwise, preview
      switchMap(s => !!s.instance && !!s.instance.state
        ? of(s)
        : (!!s.instance
          ? api.retrieve(s.instance.id)
          : api.preview({ playerId: this.ctx.id, specId: s.id } as NewChallenge)
        ).pipe(
          catchError(err => {
            this.errors.push(err);
            return of(null as unknown as Challenge);
          }),
          filter(c => !!c),
          map(c => this.syncOne({ ...c, specId: s.id }))
        )
      ),
      tap(s => this.selected = s)
    );

    // main feed
    this.specs$ = scheduled(
      [selected$, launched$],
      asyncScheduler).pipe(
        mergeAll(),
      );
  }

  validate(b: BoardPlayer): void {
    if (!b.game) {
      this.router.navigateByUrl('/');
    } else {
      this.ctx = b;
    }
  }

  ngOnDestroy(): void {
    if (!this.hubsub.closed) {
      this.hubsub.unsubscribe();
    }
    if (this.fetch$) { this.fetch$.unsubscribe(); }
  }

  startHub(b: BoardPlayer): void {
    if (b.session.isDuring) {
      this.hub.init(b.teamId);
    }
  }

  syncOne = (c: Challenge): BoardSpec => {
    this.deploying = false;

    if (!c) {
      return {} as BoardSpec;
    }

    const s = this.ctx.game.specs.find(i => i.id === c.specId);
    const isUpdated = c.score > 0 && s?.instance?.score !== c.score;

    if (!!s) {
      s.instance = c;
      this.api.checkPrereq(s, this.ctx);
      this.api.setColor(s);
    }

    if (isUpdated) {
      this.refresh$.next(this.ctx.id);
    }

    return s || {} as BoardSpec;
  };

  select(spec: BoardSpec): void {
    if (!spec.disabled && !spec.locked && (!this.selected?.id || this.selected.id !== spec.id)) {
      this.selecting$.next(spec);
    }
  }

  reselect(): void {
    const id = this.selected?.id ?? this.cid;
    if (!id) { return; }

    if (id === this.selected?.id) {
      return;
    }

    const spec = this.ctx.game.specs.find(s => s.id === id);
    if (!!spec) {
      timer(100).subscribe(() =>
        this.selecting$.next(spec)
      );
    }
  }

  launch(spec: BoardSpec): void {
    this.deploying = true;
    this.etd$ = timer(0, 1000).pipe(
      map(i => spec.averageDeploySeconds - i)
    );
    this.launching$.next(spec);
  }

  stop(model: BoardSpec): void {
    // stop gamespace
    this.deploying = true;
    if (!model.instance) { return; }
    this.api.stop(model.instance).subscribe(
      c => this.syncOne(c)
    );
  }

  start(model: BoardSpec): void {
    // start gamespace
    if (!model.instance) { return; }

    // otherwise, start gamespace
    this.deploying = true;
    this.api.start(model.instance).pipe(
      catchError(e => {
        this.errors.push(e);
        return of({} as Challenge);
      })
    ).subscribe(
      c => {
        this.syncOne(c);
      }
    );
  }

  handleRefreshRequest(id: string) {
    this.refresh$.next(this.ctx.id);
  }

  graded(): void {
    this.refresh$.next(this.ctx.id);
  }

  console(vm: VmState): void {
    let isUrl = false;

    try {
      let url = new URL(vm.id);
      isUrl = true;
    } catch (_) {
      isUrl = false;
    }

    if (isUrl) {
      this.config.showTab(vm.id);
    } else {
      this.config.openConsole(`?f=1&s=${vm.isolationId}&v=${vm.name}`);
    }
  }

  mouseenter(e: MouseEvent, spec: BoardSpec) {
    this.hoveredItem = spec;
    spec.c = 'purple';
  }

  mouseleave(e: MouseEvent, spec: BoardSpec) {
    this.hoveredItem = null;
    this.api.setColor(spec);
  }

  mousedown(e: MouseEvent, spec: BoardSpec) {
    this.select(spec);
  }
}
