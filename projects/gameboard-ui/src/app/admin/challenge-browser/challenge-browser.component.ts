// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faInfoCircle, faSearch, faSyncAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, firstValueFrom, interval, merge, Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ChallengeSummary } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Search } from '../../api/models';
import { ChallengesService } from '@/api/challenges.service';
import { ToastService } from '@/utility/services/toast.service';
import { ChallengeSubmissionsService } from '@/api/challenge-submissions.service';

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
  errors: any[] = [];

  faSearch = faSearch;
  faInfo = faInfoCircle;
  faSync = faSyncAlt;
  faCircle = faCircle;

  protected gameEngineAudit?: any[];
  protected gameEngineAuditAttempted = false;
  protected isLoadingAuditFromGameEngine = false;
  protected isLoadingSubmissions = false;
  protected selectedAudit?: any;

  constructor(
    route: ActivatedRoute,
    private api: BoardService,
    private challengesService: ChallengesService,
    private challengeSubmissionsService: ChallengeSubmissionsService,
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
        return a.map(i => {
          let { submissions, gameId, ...rest } = i as any;
          rest.archived = true;
          return rest;
        });
      }),
    );
  }

  async select(c: ChallengeSummary): Promise<void> {
    this.gameEngineAudit = undefined;
    this.gameEngineAuditAttempted = false;
    this.selected = c;
    this.selectedAudit = [];

    // if the challenge is archived, we usually have the challenge submissions
    // in the archive table
    if (c.archived) {
      const archivedSubmissions = this.archiveMap.get(c.id)?.submissions;
      this.selectedAudit = archivedSubmissions;
      return;
    }

    // otherwise, we can try to load them from GB's API
    this.isLoadingSubmissions = true;

    try {
      const submissions = await firstValueFrom(this.challengeSubmissionsService.getSubmissionsLegacy(c.id));
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

  // this is now a fallback that the user can elect to try for a challenge if 
  // we don't have the data in archive or in the GB API
  protected async auditFromGameEngine(challengeId: string): Promise<void> {
    try {
      this.isLoadingAuditFromGameEngine = true;
      this.gameEngineAudit = await firstValueFrom(this.api.audit(challengeId));

      if (!this.selectedAudit?.length) {
        this.toastService.showMessage(`No audit data available from the game engine for challenge ${challengeId}.`);
      }
    }
    catch (err: any) {
      this.errors.push(err);
    }
    finally {
      this.gameEngineAuditAttempted = true;
      this.isLoadingAuditFromGameEngine = false;
    }
  }

  async regrade(c: ChallengeSummary): Promise<void> {
    this.challengesService
      .regrade(c.id)
      .pipe(catchError((err, caught) => {
        this.errors.push(err);
        return of(null);
      }))
      .subscribe(async r => {
        if (!r) {
          return;
        }

        await this.auditFromGameEngine(c.id);
        this.toastService.showMessage(`Challenge ${c.id} was regraded.`);
      });
  }

  trackById(index: number, model: ChallengeSummary): string {
    return model.id;
  }
}
