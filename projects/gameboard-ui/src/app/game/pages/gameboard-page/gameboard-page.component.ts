// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, merge, Observable, of, Subject, timer } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { faArrowLeft, faBolt, faExclamationTriangle, faTrash, faTv } from '@fortawesome/free-solid-svg-icons';

import { BoardPlayer, BoardSpec, Challenge, NewChallenge, VmState } from '@/api/board-models';
import { BoardService } from '@/api/board.service';
import { ApiUser } from '@/api/user-models';
import { ConfigService } from '@/utility/config.service';
import { NotificationService } from '@/services/notification.service';
import { UserService } from '@/utility/user.service';
import { GameboardPerformanceSummaryViewModel } from '@/core/components/gameboard-performance-summary/gameboard-performance-summary.component';
import { BrowserService } from '@/services/browser.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '@/api/models';
import { ConfirmButtonComponent } from '@/core/components/confirm-button/confirm-button.component';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ChallengesService } from '@/api/challenges.service';

@Component({
  selector: 'app-gameboard-page',
  templateUrl: './gameboard-page.component.html',
  styleUrls: ['./gameboard-page.component.scss'],
  providers: [UnsubscriberService]
})
export class GameboardPageComponent {
  refresh$ = new Subject<string>();
  ctx!: BoardPlayer;
  hoveredItem: BoardSpec | null = null;
  selected!: BoardSpec;
  selecting$ = new Subject<BoardSpec>();
  launching$ = new Subject<BoardSpec>();

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
  cid = '';
  performanceSummaryViewModel?: GameboardPerformanceSummaryViewModel;

  @ViewChild("startChallengeConfirmButton") protected startChallengeConfirmButton?: ConfirmButtonComponent;

  constructor(
    route: ActivatedRoute,
    title: Title,
    usersvc: UserService,
    private browserService: BrowserService,
    private api: BoardService,
    private challengeService: ChallengesService,
    private config: ConfigService,
    private hub: NotificationService,
    private unsub: UnsubscriberService
  ) {

    this.user$ = usersvc.user$;
    this.unsub.add(hub.challengeEvents.subscribe(ev => this.syncOne(ev.model as Challenge)));
    this.unsub.add(
      merge(
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
          title.setTitle(`${b.game.name} | ${this.config.appName}`);

          this.performanceSummaryViewModel = {
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
            }
          };
        }),
        tap(b => this.startHub(b)),
        tap(() => this.reselect())
      ).subscribe()
    );

    this.unsub.add(
      this.launching$.pipe(
        switchMap(async s => {
          try {
            const launchedSpec = await firstValueFrom(
              api.launch({
                playerId: this.ctx.id,
                specId: s.id,
                variant: this.variant,
                userId: usersvc.user$.value!.id
              })
            );

            return launchedSpec;
          }
          catch (err: any) {
            this.renderLaunchError(err);
            return s.instance || null as unknown as Challenge;
          }
        }),
        tap(c => this.deploying = false),
        filter(c => !!c),
        map(c => this.syncOne(c))
      ).subscribe()
    );

    this.unsub.add(
      this.selecting$.pipe(
        // If s.instance does not exist, fetch; otherwise, preview
        switchMap(s => !!s.instance && !!s.instance.state
          ? of(s)
          : (!!s.instance
            ? challengeService.retrieve(s.instance.id)
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
        // don't persist the "confirming" state if they switch challenges (#178)
        tap(c => this.startChallengeConfirmButton?.stopConfirming()),
        tap(s => this.selected = s)
      ).subscribe()
    );
  }

  private startHub(b: BoardPlayer): void {
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

    // search both challenges and spec ids for selection
    let spec = this.ctx.game.specs.find(s => s.id === id);
    if (!spec)
      spec = this.ctx.game.specs.find(s => s?.instance?.id === id);

    if (!!spec) {
      timer(100).subscribe(() => {
        this.selecting$.next(spec!);
      });
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
    this.api.stop({ id: model.instance.id }).subscribe(
      c => this.syncOne(c)
    );
  }

  start(model: BoardSpec): void {
    // start gamespace
    if (!model.instance) { return; }

    // otherwise, start gamespace
    this.deploying = true;
    this.api.start({ id: model.instance.id }).pipe(
      catchError(e => {
        this.renderLaunchError(e);
        return of({} as Challenge);
      })
    ).subscribe(
      c => {
        this.syncOne(c);
      }
    );
  }

  handleRefreshRequest(playerId: string) {
    this.refresh$.next(playerId);
  }

  graded(): void {
    this.refresh$.next(this.ctx.id);
  }

  console(vm: VmState): void {
    let isUrl = false;

    try {
      new URL(vm.id);
      isUrl = true;
    } catch (_) {
      isUrl = false;
    }

    if (isUrl) {
      this.browserService.showTab(vm.id);
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

  // ugly temporary workaround for prettified gamespace error message
  // (we're improving error rendering in general in https://github.com/cmu-sei/Gameboard/issues/155)
  private renderLaunchError(err: HttpErrorResponse | ApiError) {
    let errorMsg: any = "";

    try {
      if ("error" in err && err.error?.message) {
        const loweredMessage = err.error.message.toLowerCase();
        if (loweredMessage.indexOf("gamespace") >= 0) {
          errorMsg = "Unable to deploy resources for this challenge because you've reached the gamespace limit for the game. Complete or destroy the resources of other challenges to work on this one.";
        } else {
          errorMsg = err.error.message;
        }
      }
      else if (err.message) {
        errorMsg = err.message;
      } else {
        const stringified = JSON.stringify(err);
        errorMsg = stringified == "{}" ? "Unspecified error" : stringified;
      }
    }
    catch (renderError: any) {
      errorMsg = renderError;
    }

    this.errors.push(errorMsg);
  }
}
