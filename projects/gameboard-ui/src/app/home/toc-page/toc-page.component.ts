// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { TocService } from '@/api/toc.service';

@Component({
  selector: 'app-toc-page',
  styles: [
    ".reader { max-width: 1080px; margin: 0 auto; }"
  ],
  template: `
    <div class="reader">
      <ng-container *ngIf="doc$ | async as doc; else loading">
          <markdown [data]="doc"></markdown>
      </ng-container>
  </div>

  <ng-template #loading>
      <div class="text-center">
          <app-spinner></app-spinner>
      </div>
  </ng-template>
`
})
export class TocPageComponent {
  doc$: Observable<string>;

  constructor(
    route: ActivatedRoute,
    api: TocService
  ) {
    this.doc$ = combineLatest([
      route.params,
      api.loaded$
    ]).pipe(
      map(([p, ready]) => ({ p, ready })),
      filter(ctx => !!ctx.ready),
      switchMap(ctx => api.tocfile$(ctx.p.id))
    );
  }
}
