// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, merge, Observable, Subject, timer } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { BoardGame } from '../../api/board-models';
import { Game, GameGroup } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { fa } from '@/services/font-awesome.service';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private practiceService = inject(PracticeService);

  featured$: Observable<Game[]>;
  ongoing$: Observable<Game[]>;
  past$: Observable<GameGroup[]>;
  present$: Observable<Game[]>;
  future$: Observable<GameGroup[]>;

  protected fa = fa;
  protected hot!: Game | null;
  protected practiceAreaRoute?: UrlTree;
  protected searchText = "";
  protected typing$ = new Subject<void>();

  constructor(
    private router: Router,
    private routerService: RouterService,
    api: GameService
  ) {
    this.featured$ = this.buildGameGroupObservable(() => api.list({ isFeatured: true, term: this.searchText }));
    this.future$ = this.buildGameGroupObservable(() => api.listGrouped({ filter: ['future', "competitive"], isOngoing: false, term: this.searchText }));
    this.ongoing$ = this.buildGameGroupObservable(() => api.list({ isOngoing: true, term: this.searchText }));
    this.past$ = this.buildGameGroupObservable(() => api.listGrouped({ filter: ['past', "competitive"], term: this.searchText }));
    this.present$ = this.buildGameGroupObservable(() => api.list({ filter: ["present", "competitive"], isOngoing: false, term: this.searchText }));
  }

  public async ngOnInit(): Promise<void> {
    if (await this.practiceService.isEnabled()) {
      this.practiceAreaRoute = this.routerService.getPracticeAreaUrl();
    }
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
    this.typing$.next();
  }

  private buildGameGroupObservable<T>(apiCall: () => Observable<T>) {
    return merge(
      this.typing$.pipe(debounceTime(400)),
      timer(0, 60000),
    ).pipe(
      switchMap(apiCall)
    );
  }
}
