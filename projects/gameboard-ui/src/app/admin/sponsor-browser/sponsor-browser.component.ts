// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faArrowLeft, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, from, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, filter, map, mergeAll, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ChangedSponsor, NewSponsor, Sponsor } from '../../api/sponsor-models';
import { SponsorService } from '../../api/sponsor.service';

@Component({
  selector: 'app-sponsor-browser',
  templateUrl: './sponsor-browser.component.html',
  styleUrls: ['./sponsor-browser.component.scss']
})
export class SponsorBrowserComponent {
  refresh$ = new BehaviorSubject<any>(true);
  source$: Observable<Sponsor[]>;
  source!: Sponsor[];
  creating$ = new Subject<NewSponsor>();
  created$: Observable<Sponsor>;
  updating$ = new Subject<ChangedSponsor>();
  updated$: Observable<Sponsor>;
  deleteing$ = new Subject<Sponsor>();
  deleted$: Observable<any>;
  dropping$ = new Subject<File[]>();
  dropped$: Observable<Sponsor>;
  faPlus = faPlus;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;

  newSponsor: NewSponsor = { id: '', name: '' };

  constructor(
    private api: SponsorService
  ) {
    this.source$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(() => api.list({})),
      tap(r => this.source = r)
    );

    this.created$ = this.creating$.pipe(
      filter(m => !!m.id),
      switchMap(m => api.create(m)),
      tap(r => this.source.unshift(r)),
      tap(r => this.clear())
    );

    this.updated$ = this.updating$.pipe(
      mergeMap(m => api.update(m))
    );

    this.deleted$ = this.deleteing$.pipe(
      filter(m => !!m.id),
      switchMap(m => api.delete(m.id)),
      tap(r => this.refresh$.next(true))
    );

    this.dropped$ = this.dropping$.pipe(
      switchMap(l => from(l)),
      mergeMap(f => api.upload(f), 3),
      tap(() => this.refresh$.next(true))
    );
  }

  create(): void {
    this.creating$.next(this.newSponsor);
  }

  clear(): void {
    this.newSponsor.id = '';
    this.newSponsor.name = '';
  }

  update(s: ChangedSponsor): void {
    this.updating$.next(s);
  }

  delete(s: Sponsor): void {
    this.deleteing$.next(s);
  }

  remove(s: Sponsor): void {
    const target = this.source.find(i => i.id === s.id);
    if (!target) { return; }
    const index = this.source.indexOf(target);
    this.source.splice(index, 1);
  }

  dropped(files: File[]): void {
    this.dropping$.next(files);
  }
}
