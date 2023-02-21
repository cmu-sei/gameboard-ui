// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, Observable, scheduled, Subject } from 'rxjs';
import { debounceTime, map, mergeAll, switchMap, tap } from 'rxjs/operators';
import { ChallengeGate } from '../../api/board-models';
import { GameService } from '../../api/game.service';
import { Spec } from '../../api/spec-models';

@Component({
  selector: 'app-prereqs',
  templateUrl: './prereqs.component.html',
  styleUrls: ['./prereqs.component.scss']
})
export class PrereqsComponent implements OnChanges {
  @Input() gameId = '';
  @Input() specs: Spec[] = [];
  list$: Observable<ChallengeGate[]>;
  list: ChallengeGate[] = [];
  refresh$ = new Subject<boolean>();
  updating$ = new Subject<ChallengeGate>();
  deleting$ = new Subject<ChallengeGate>();
  newgate = {} as ChallengeGate;
  faTrash = faTrash;
  faPlus = faPlus;

  constructor(
    api: GameService
  ) {
    this.list$ = scheduled([

      this.refresh$.pipe(
        debounceTime(500),
        switchMap(() => api.getPrereqs(this.gameId))
      ),

      this.updating$.pipe(
        switchMap(g => api.savePrereq(g)),
        tap(g => this.newgate = {} as ChallengeGate),
        switchMap(g => api.getPrereqs(g.gameId))
      ),

      this.deleting$.pipe(
        switchMap(g => api.deletePrereq(g.id)),
        switchMap(() => api.getPrereqs(this.gameId))
      )

    ], asyncScheduler).pipe(
      mergeAll(),
      tap(r => this.list = r),
      map(r => {
        return r.map(p => {
          const t = this.specs.find(s => s.id === p.targetId);
          const d = this.specs.find(s => s.id === p.requiredId);
          p.targetTag = t?.tag || t?.id.slice(0, 8) || '';
          p.requiredTag = d?.tag || d?.id.slice(0, 8) || '';
          return p;
        })
      })
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.specs || changes.gameId) {
      this.refresh$.next(true);
    }
  }

  save(): void {
    const t = this.specs.find(s => s.tag == this.newgate.targetTag);
    const s = this.specs.find(s => s.tag == this.newgate.requiredTag);
    if (!t || !s) { return; }

    this.newgate.requiredId = s.id;
    this.newgate.targetId = t.id;
    this.newgate.gameId = this.gameId;

    this.updating$.next(this.newgate);
  }

  delete(g: ChallengeGate): void {
    this.deleting$.next(g);
  }
}

export interface Prereq {
  key: string;
  requires: string;
  score: number;
}
