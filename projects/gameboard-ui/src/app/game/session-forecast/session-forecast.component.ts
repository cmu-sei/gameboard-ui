// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { combineLatest, interval, Observable, Subject, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Game, SessionForecast } from '../../api/game-models';
import { GameService } from '../../api/game.service';

@Component({
    selector: 'app-session-forecast',
    templateUrl: './session-forecast.component.html',
    styleUrls: ['./session-forecast.component.scss'],
    standalone: false
})
export class SessionForecastComponent implements OnInit, AfterViewInit {
  @Input() game!: Game;
  refresh$ = new Subject<string>();
  forecast$: Observable<SessionForecast[]>;

  constructor(
    api: GameService
  ) {
    this.forecast$ = combineLatest([
      this.refresh$,
      timer(0, 60000)
    ]).pipe(
      map(([id, i]) => id),
      switchMap(id => api.sessionForecast(id)),
      map(f => this.transform(f))
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.refresh$.next(this.game.id);
  }

  transform(f: SessionForecast[]): SessionForecast[] {
    // f[0].available = 0;
    // f[1].available = 0;
    // f[2].available = 1;
    // f[3].available = 2;
    // f[4].available = 3;
    // f[5].available = 4;
    // f[6].available = 5;
    // f[7].available = 10;
    // f[8].available = 20;
    // f[9].available = 45;
    // f[0].reserved = 50;
    // f[1].reserved = 50;
    // f[2].reserved = 49;
    // f[3].reserved = 48;
    // f[4].reserved = 47;
    // f[5].reserved = 46;
    // f[6].reserved = 45;
    // f[7].reserved = 40;
    // f[8].reserved = 30;
    // f[9].reserved = 5;

    f.forEach(item => {
      const ts = new Date(item.time);
      item.text = `${(''+ts.getHours()).padStart(2, '0')}:${(''+ts.getMinutes()).padStart(2, '0')}`;
      item.percent = item.available / (item.available + item.reserved);
    });

    return f;
  }
}
