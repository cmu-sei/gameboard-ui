// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { KeyValue } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faSyncAlt, faTv, faExternalLinkAlt, faExpandAlt, faUser, faThLarge, faMinusSquare, faPlusSquare, faCompressAlt, faSortAlphaDown, faSortAmountDownAlt, faAngleDoubleUp, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, timer, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, tap, switchMap, map } from 'rxjs/operators';
import { ConsoleActor, ObserveChallenge, ObserveVM } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ConfigService } from '../../utility/config.service';
@Component({
  selector: 'app-challenge-observer',
  templateUrl: './challenge-observer.component.html',
  styleUrls: ['./challenge-observer.component.scss'],
})
export class ChallengeObserverComponent implements OnInit, OnDestroy {
  refresh$ = new BehaviorSubject<boolean>(true);
  game?: Game;
  table: Map<string, ObserveChallenge> = new Map<string, ObserveChallenge>(); // table of player challenges to display
  fetchActors$: Observable<Map<string, ConsoleActor[]>>; // stream updates of mapping users to consoles
  tableData: Subscription; // subscribe to stream of new data to update table map
  gameData: Subscription; // subscribe to game retrieved based on route id
  typing$ = new BehaviorSubject<string>(""); // search term typing event
  term$: Observable<string>; // search term to filter by
  gid = '';
  mksHost: string; // host url for mks console viewer
  sort: string = "byName"; // default sort method, other is "byRank"
  maxRank: number = 1;
  isLoading: boolean = true;
  faArrowLeft = faArrowLeft;
  faTv = faTv;
  faSync = faSyncAlt;
  faGrid = faThLarge;
  faExternalLinkAlt = faExternalLinkAlt;
  faExpandAlt = faExpandAlt;
  faCompressAlt = faCompressAlt;
  faUser = faUser;
  faMinusSquare = faMinusSquare;
  faPlusSquare = faPlusSquare;
  faSortAmountDown = faSortAmountDownAlt;
  faSortAlphaDown = faSortAlphaDown;
  faAngleDoubleUp = faAngleDoubleUp;
  faWindowRestore = faWindowRestore;
  constructor(
    route: ActivatedRoute,
    private api: BoardService,
    private gameApi: GameService,
    private conf: ConfigService
  ) {
    this.mksHost = conf.mkshost;
    this.gameData = route.params.pipe(
      switchMap(a => this.gameApi.retrieve(a.id))
    ).subscribe(game => this.game = game);
    this.tableData = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60_000) // *every 60 sec* refresh challenge data (score/duration updates and new deploys) 
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.gid = a.id),
      tap(() => this.isLoading = true),
      switchMap(() => this.api.consoles(this.gid)),
    ).subscribe(data => {
      this.updateTable(data);
      this.isLoading = false;
    });
    this.fetchActors$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 10_000) // *every 10 sec* refresh which users are one which consoles 
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.gid = a.id),
      switchMap(() => this.api.consoleActors(this.gid)),
      map(data => data.reduce((map, item) => {
        const key = `${item.challengeId}#${item.vmName}`;
        if (map.has(key)) {
          map.get(key)!.push(item);
        } else {
          map.set(key, [item]);
        }
        return map;
      }, new Map<string, ConsoleActor[]>()))
    );
    this.term$ = this.typing$.pipe(
      debounceTime(500)
    );
  }

  updateTable(data: ObserveChallenge[]) {
    for (let updatedChallenge of data) {
      if (this.table.has(updatedChallenge.id)) {
        // modify fields with updates values without resetting the entire challenge object
        let challenge = this.table.get(updatedChallenge.id)!;
        challenge.gameRank = updatedChallenge.gameRank;
        challenge.gameScore = updatedChallenge.gameScore;
        challenge.challengeScore = updatedChallenge.challengeScore;
        challenge.duration = updatedChallenge.duration;
      } else {
        this.table.set(updatedChallenge.id, updatedChallenge);
      }
      if (updatedChallenge.gameRank > this.maxRank)
        this.maxRank = updatedChallenge.gameRank;
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.tableData.unsubscribe();
    this.gameData.unsubscribe();
  }

  go(vm: ObserveVM): void {
    this.conf.openConsole(`?f=0&o=1&s=${vm.challengeId}&v=${vm.name}`);
  }

  toggleShowConsoles(challenge: ObserveChallenge) {
    challenge.expanded = !challenge.expanded;
  }

  togglePinRow(challenge: ObserveChallenge) {
    challenge.pinned = !challenge.pinned;
  }

  toggleFullWidth(vm: ObserveVM) {
    vm.fullWidth = !vm.fullWidth;
  }

  toggleMinimize(vm: ObserveVM) {
    vm.minimized = !vm.minimized;
  }

  minimizeAllOthers(vm: ObserveVM, challenge: ObserveChallenge): void {
    for (let console of challenge?.consoles || []) {
      if (console.id != vm.id)
        console.minimized = true;
    }
  }

  // Custom Functions for "ngFor"

  // TrackBy Function to only reload rows when needed
  // Helpful for inserting new challenge row asynchronously without reloading existing rows
  trackByChallengeId(_index: number, challengeItem: KeyValue<string, ObserveChallenge>) {
    return challengeItem.value.id;
  }

  // Order by PlayerName (team name), then order by Name (challenge name)
  // I.E. Sort alphabetically by Team Name, then order by challenge name for challenges of the same team.
  // Note: this is the same sorting done on the server, however this is needed for inserting new rows asynchronously in order.
  sortByName(a: KeyValue<string, ObserveChallenge>, b: KeyValue<string, ObserveChallenge>) {
    if (a.value.playerName < b.value.playerName) return -1;
    if (a.value.playerName > b.value.playerName) return 1;
    if (a.value.name < b.value.name) return -1;
    if (a.value.name > b.value.name) return 1;
    return 0;
  }
}
