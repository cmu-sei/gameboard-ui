// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faEllipsisV, faInfoCircle, faSearch, faSyncAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ChallengeSummary } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Search } from '../../api/models';
import { ChallengesService } from '@/api/challenges.service';

@Component({
  selector: 'app-challenge-browser',
  templateUrl: './challenge-browser.component.html',
  styleUrls: ['./challenge-browser.component.scss']
})
export class ChallengeBrowserComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  challenges$: Observable<ChallengeSummary[]>;
  challenges: ChallengeSummary[] = [];
  archived$: Observable<ChallengeSummary[]>;
  archiveMap = new Map<string, ChallengeSummary>(); // alternative to calling `/audit` endpoint
  search: Search = { term: '', take: 100 };
  selected?: ChallengeSummary;
  // audited$: Observable<any>;
  // auditing$ = new Subject<ChallengeSummary>();
  selectedAudit!: any;
  errors: any[] = [];

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faDetail = faEllipsisV;
  faInfo = faInfoCircle;
  faSync = faSyncAlt;
  faCircle = faCircle;

  constructor(
    private api: BoardService,
    private challengesService: ChallengesService,
    private route: ActivatedRoute,
  ) {

    route.queryParams.pipe(
      tap(p => this.search.term = p.search || "")
    ).subscribe(
      () => this.refresh$.next(true)
    );

    this.challenges$ = merge(
      this.refresh$,
      interval(60000).pipe(
        filter(i => !this.search.term)
      )
    ).pipe(
      debounceTime(500),
      switchMap(() => api.list(this.search)),
      tap(r => this.challenges = r),
      tap(result => {
        if (result.length == 1)
          this.select(result[0]);
      })
    );
    this.archived$ = merge(
      this.refresh$,
      interval(60000).pipe(
        filter(i => !this.search.term)
      )
    ).pipe(
      debounceTime(500),
      switchMap(() => api.archived(this.search)),
      tap(a => this.archiveMap = new Map(a.map(i => [i.id, i]))),
      map(a => {
        // remove properties that aren't displayed for current challenges for consistency
        return a.map(i => {
          let { submissions, gameId, ...rest } = i as any;
          rest.archived = true;
          return rest;
        });
      }),
    );

    // this.audited$ = this.auditing$.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   switchMap(c => api.audit(c.id)),
    //   tap(r => this.selectedAudit = r)
    // );

  }

  ngOnInit(): void {
  }

  select(c: ChallengeSummary): void {
    this.selected = c;
    this.selectedAudit = [];
    // todo: fetch challenge events / submissions
  }

  audit(c: ChallengeSummary): void {
    if (c.archived) {
      // archived challenges already contain submissions, so no need for API call
      this.selectedAudit = this.archiveMap.get(c.id)?.submissions;
    } else {
      this.api.audit(c.id).subscribe(
        r => this.selectedAudit = r,
        (err) => this.errors.push(err)
      );
    }
  }

  regrade(c: ChallengeSummary): void {
    this.challengesService.regrade(c.id).subscribe(
      r => this.selectedAudit = r,
      (err) => this.errors.push(err)
    );
  }

  trackById(index: number, model: ChallengeSummary): string {
    return model.id;
  }
}
