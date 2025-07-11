// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Output } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ExternalSpec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';

@Component({
    selector: 'app-spec-browser',
    templateUrl: './spec-browser.component.html',
    styleUrls: ['./spec-browser.component.scss'],
    standalone: false
})
export class SpecBrowserComponent {
  @Output() selected = new EventEmitter<ExternalSpec>();

  refresh$ = new BehaviorSubject<boolean>(true);
  list$: Observable<ExternalSpec[]>;
  search: Search = { term: '', filter: ['play'] };
  faSearch = faSearch;

  constructor(
    private api: SpecService
  ) {
    this.list$ = this.refresh$.pipe(
      debounceTime(250),
      switchMap(() => api.list(this.search))
    );
  }

  typing(e: Event): void {
    this.refresh$.next(true);
  }

  select(spec: ExternalSpec): void {
    this.selected.emit(spec);
  }

  trackById(index: number, g: ExternalSpec): string {
    return g.externalId;
  }
}
