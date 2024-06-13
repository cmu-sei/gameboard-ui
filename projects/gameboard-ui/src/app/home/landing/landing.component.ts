// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faGamepad, faPlusSquare, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { BoardGame } from '../../api/board-models';
import { Game, GameGroup } from '../../api/game-models';
import { GameService } from '../../api/game.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);
  featured$: Observable<Game[]>;
  past$: Observable<GameGroup[]>;
  present$: Observable<Game[]>;
  future$: Observable<GameGroup[]>;

  hot!: Game | null;

  faGamepad = faGamepad;
  faUserPlus = faUserPlus;
  faSearch = faSearch;
  faPlusSquare = faPlusSquare;

  showSearchBar = false;
  searchText = "";

  constructor(
    private router: Router,
    api: GameService
  ) {
    this.featured$ = this.refresh$.pipe(
      debounceTime(400),
      switchMap(() => api.list({ isFeatured: true, filter: [], term: this.searchText })),
      tap(g => { if (g.length > 0) { this.showSearchBar = true; } }),
    );
    this.past$ = this.refresh$.pipe(
      debounceTime(400),
      switchMap(() => api.listGrouped({ filter: ['past', "competitive"], term: this.searchText })),
      tap(g => { if (g.length > 0) { this.showSearchBar = true; } }),
    );
    this.present$ = this.refresh$.pipe(
      debounceTime(200),
      switchMap(() => api.list({ filter: ["present", "competitive"], term: this.searchText })),
      tap(g => { if (g.length > 0) { this.showSearchBar = true; } })
    );
    this.future$ = this.refresh$.pipe(
      debounceTime(300),
      switchMap(() => api.listGrouped({ filter: ['future', "competitive"], term: this.searchText })),
      tap(g => { if (g.length > 0) { this.showSearchBar = true; } })
    );
  }

  ngOnInit(): void {
  }

  selected(game: Game | BoardGame): void {
    this.router.navigate(['/game', game.id]);
  }

  on(g: Game): void {
    this.hot = g;
  }

  off(g: Game): void {
    this.hot = null;
  }

  typing(e: Event): void {
    this.refresh$.next(true);
  }
}
