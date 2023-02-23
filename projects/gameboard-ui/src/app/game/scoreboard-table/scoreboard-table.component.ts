// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, iif, interval, merge, Observable, Subject, timer } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { PlayerSearch, Standing, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';

@Component({
  selector: 'app-scoreboard-table',
  templateUrl: './scoreboard-table.component.html',
  styleUrls: ['./scoreboard-table.component.scss']
})
export class ScoreboardTableComponent implements OnChanges, AfterViewInit {
  @Input() id = '';
  @Input() live = false;

  refresh$ = new Subject<boolean>();
  scores$: Observable<Standing[]>;
  scores: Standing[] = [];
  search: PlayerSearch = { filter: ['scored'] };
  faStar = faStar;

  constructor(
    api: PlayerService
  ) {
    const liveFetch$ = iif(
      () => this.live,
      timer(1000, 60000),
      timer(1000)
    );

    const fetch$ = combineLatest([
      this.refresh$.pipe(debounceTime(500)),
      liveFetch$
    ]).pipe(
      map(([s, i]) => s),
      switchMap(s => api.scores(this.search)),
      tap(r => this.scores = r)
    );

    const update$ = iif(
      () => this.live,
      interval(1000),
      timer(1000)
    ).pipe(
      map(() => this.scores)
    );

    this.scores$ = merge(
      fetch$,
      update$
    ).pipe(
      tap(r => r.forEach(s => s.session = new TimeWindow(s.sessionBegin, s.sessionEnd)))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.id) {
      this.search.gid = changes.id.currentValue;
      this.refresh$.next(true);
    }
  }

  ngAfterViewInit(): void {
    this.search.gid = this.id;
    this.refresh$.next(true);
  }

  trackById(index: number, s: Standing): string {
    return s.teamId;
  }
}
