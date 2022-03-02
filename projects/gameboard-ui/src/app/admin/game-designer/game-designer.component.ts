// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, HostListener, OnInit } from '@angular/core';
import { faArrowLeft, faCopy, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, BehaviorSubject, merge, Observable, of, scheduled, Subject } from 'rxjs';
import { catchError, debounceTime, delay, filter, map, mergeAll, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Game, NewGame } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Search } from '../../api/models';
import * as YAML from 'yaml';
import { ClipboardService } from '../../utility/clipboard.service';

@Component({
  selector: 'app-game-designer',
  templateUrl: './game-designer.component.html',
  styleUrls: ['./game-designer.component.scss']
})
export class GameDesignerComponent implements OnInit {
  refresh$ = new BehaviorSubject<any>(true);
  creating$ = new Subject<NewGame>();
  created$: Observable<NewGame>;
  games$: Observable<Game[]>;
  games: Game[] = [];
  game: any;
  search: Search = { term: '' };

  faArrowLeft = faArrowLeft;
  faPlus = faPlus;
  faCopy = faCopy;
  faTrash = faTrash;

  constructor(
    private api: GameService,
    private clipboard: ClipboardService
  ) {
    this.games$ = this.refresh$.pipe(
      debounceTime(250),
      switchMap(() => api.list(this.search)),
      tap(result => this.games = result)
    );

    this.created$ = this.creating$.pipe(
      mergeMap(m => api.create(m)),
      tap(m => this.games.unshift(m)),
      tap(m => this.select(m))
    );

  }

  ngOnInit(): void {
  }

  create(): void {
    this.creating$.next({name: 'NewGame'} as Game);
  }

  delete(game: Game): void {
    this.api.delete(game.id).subscribe(
      () => this.remove(game)
    );
  }

  remove(game: Game): void {
    const index = this.games.indexOf(game);
    this.games.splice(index, 1);
    if (this.game === game) {
      this.game = null;
    }
  }

  select(game: Game): void {
    this.game = game;
  }

  unselect(): void {
    this.game = null;
  }

  typing(e: Event): void {
    this.refresh$.next(true);
  }

  clone(game: Game): void {
    this.creating$.next({...game, name: `${game.name}_CLONE`, isClone: true});
  }

  clip(game: Game): void {
    this.clipboard.copyToClipboard(
      YAML.stringify(game, this.replacer)
    );
  }

  // don't stringify parsed feedbackTemplate object, just string property
  replacer(key: any, value: any) {
    if (key == "feedbackTemplate") return undefined;
    else return value;
  }

  trackById(index: number, g: Game): string {
    return g.id;
  }

  dropped(files: File[]): void {
    files.forEach(file => {
      const fr = new FileReader();
      fr.onload = ev => {
        const model = YAML.parse(fr.result as string) as Game[];
        model.forEach(m => this.creating$.next({...m, isClone: true}));
      }
      if (file.size < 8192) {
        fr.readAsText(file);
      }
    })
  }

}
