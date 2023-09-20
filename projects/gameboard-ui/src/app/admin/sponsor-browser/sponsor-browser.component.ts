// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { debounceTime, filter, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ChangedSponsor, Sponsor } from '../../api/sponsor-models';
import { SponsorService } from '../../api/sponsor.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-sponsor-browser',
  templateUrl: './sponsor-browser.component.html',
  styleUrls: ['./sponsor-browser.component.scss']
})
export class SponsorBrowserComponent {
  refresh$ = new BehaviorSubject<any>(true);
  source$: Observable<Sponsor[]>;
  source!: Sponsor[];
  updating$ = new Subject<ChangedSponsor>();
  updated$: Observable<Sponsor>;
  deleting$ = new Subject<Sponsor>();
  deleted$: Observable<any>;

  protected errors: any[] = [];
  protected fa = fa;

  constructor(
    api: SponsorService,
    private toastsService: ToastService) {
    this.source$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(() => api.list({})),
      tap(r => this.source = r)
    );

    this.updated$ = this.updating$.pipe(
      mergeMap(m => api.update(m))
    );

    this.deleted$ = this.deleting$.pipe(
      filter(m => !!m.id),
      switchMap(m => api.delete(m.id)),
      tap(r => this.refresh$.next(true))
    );
  }

  update(s: ChangedSponsor): void {
    this.updating$.next(s);
  }

  delete(s: Sponsor): void {
    this.deleting$.next(s);
  }

  remove(s: Sponsor): void {
    const target = this.source.find(i => i.id === s.id);
    if (!target) { return; }
    const index = this.source.indexOf(target);
    this.source.splice(index, 1);
  }

  protected handleSponsorSaved(sponsor: Sponsor) {
    this.toastsService.showMessage(`Saved sponsor "${sponsor.name}".`);
    this.refresh$.next(true);
  }
}
