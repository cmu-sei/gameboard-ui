// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faEllipsisV, faInfoCircle, faSearch, faSyncAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, firstValueFrom, interval, merge, Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ChallengeSummary } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Search } from '../../api/models';
import { ChallengesService } from '@/api/challenges.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-challenge-browser',
  templateUrl: './challenge-browser.component.html',
  styleUrls: ['./challenge-browser.component.scss']
})
export class ChallengeBrowserComponent {
  refresh$ = new BehaviorSubject<boolean>(true);
  challenges$: Observable<ChallengeSummary[]>;
  challenges: ChallengeSummary[] = [];
  archived$: Observable<ChallengeSummary[]>;
  archiveMap = new Map<string, ChallengeSummary>(); // alternative to calling `/audit` endpoint
  search: Search = { term: '', take: 100 };
  selected?: ChallengeSummary;
  selectedAudit!: any;
  errors: any[] = [];

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faDetail = faEllipsisV;
  faInfo = faInfoCircle;
  faSync = faSyncAlt;
  faCircle = faCircle;

  protected isLoadingSubmissions = false;

  constructor(
    route: ActivatedRoute,
    private api: BoardService,
    private challengesService: ChallengesService,
    private toastService: ToastService,
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
  }

  async select(c: ChallengeSummary): Promise<void> {
    this.selected = c;
    this.selectedAudit = [];

    if (c.archived) {
      return;
    }

    this.isLoadingSubmissions = true;

    try {
      const submissions = await firstValueFrom(this.challengesService.getSubmissions(c.id));
      this.selectedAudit = submissions.submittedAnswers.map(s => {
        return { submittedOn: s.submittedOn, answers: s.answers.map(a => a || "(no response)") };
      });
    }
    catch (err: any) {
      this.isLoadingSubmissions = false;
      this.errors.push(`Couldn't load submissions for challenge ${c.id}`);
    }
    finally {
      this.isLoadingSubmissions = false;
    }
  }

  async audit(c: ChallengeSummary): Promise<void> {
    if (c.archived) {
      // archived challenges already contain submissions, so no need for API call
      this.selectedAudit = this.archiveMap.get(c.id)?.submissions;
      return;
    }

    try {
      this.selectedAudit = await firstValueFrom(this.api.audit(c.id));
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  regrade(c: ChallengeSummary): void {
    this.challengesService
      .regrade(c.id)
      .pipe(catchError((err, caught) => {
        this.errors.push(err);
        return of(null);
      }))
      .subscribe(r => {
        if (!r) {
          return;
        }

        this.selectedAudit = r;
        this.toastService.showMessage(`Challenge ${c.id} was regraded.`);
      });
  }

  trackById(index: number, model: ChallengeSummary): string {
    return model.id;
  }
}
