// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap} from 'rxjs/operators';
import { TocService } from '../../api/toc.service';

@Component({
  selector: 'app-toc-page',
  templateUrl: './toc-page.component.html',
  styleUrls: ['./toc-page.component.scss']
})
export class TocPageComponent implements OnInit {
  doc$: Observable<string>;

  constructor(
    route: ActivatedRoute,
    api: TocService
  ) {
    this.doc$ = combineLatest([
      route.params,
      api.loaded$
    ]).pipe(
      map(([p, ready]) => ({p, ready})),
      filter(ctx => !!ctx.ready),
      switchMap(ctx => api.tocfile$(ctx.p.id))
    );
  }

  ngOnInit(): void {
  }

}
