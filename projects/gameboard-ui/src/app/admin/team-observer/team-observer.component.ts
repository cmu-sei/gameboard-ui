import { KeyValue } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faSyncAlt, faTv, faExternalLinkAlt, faExpandAlt, faUser, faThLarge, faMinusSquare, faPlusSquare, faCompressAlt, faSortAlphaDown, faSortAmountDownAlt, faAngleDoubleUp, faUsers, faWindowMaximize, faBullseye, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, timer, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, tap, switchMap, map, filter } from 'rxjs/operators';
import { ConsoleActor } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ObserveTeam, ObserveTeamMember, Team } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ConfigService } from '../../utility/config.service';

@Component({
  selector: 'app-team-observer',
  templateUrl: './team-observer.component.html',
  styleUrls: ['./team-observer.component.scss']
})
export class TeamObserverComponent implements OnInit, OnDestroy {
  @Input() gameId?: string;

  refresh$ = new BehaviorSubject<boolean>(true);
  game?: Game; // game info like team or individual
  table: Map<string, ObserveTeam> = new Map<string, ObserveTeam>(); // table of teams to display
  tableData: Subscription; // subscribe to stream of new data to update table map
  gameData: Subscription; // subscribe to game retrieved based on route id
  actorMap: Map<string, ConsoleActor> = new Map<string, ConsoleActor>();
  fetchActors$: Observable<Map<string, ConsoleActor>>; // stream updates of mapping users to consoles
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
  faUsers = faUsers;
  faMinusSquare = faMinusSquare;
  faPlusSquare = faPlusSquare;
  faSortAmountDown = faSortAmountDownAlt;
  faSortAlphaDown = faSortAlphaDown;
  faAngleDoubleUp = faAngleDoubleUp;
  faWindowRestore = faWindowRestore;

  protected isLegacyMode = false;
  protected searchText = "";

  constructor(
    route: ActivatedRoute,
    private api: BoardService,
    private playerApi: PlayerService,
    private gameApi: GameService,
    private conf: ConfigService
  ) {
    this.mksHost = conf.mkshost;
    this.gameData = route.params.pipe(
      filter(a => !!(this.gameId || a.id)),
      switchMap(a => this.gameApi.retrieve(this.gameId || a.id))
    ).subscribe(game => this.game = game);
    this.tableData = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60_000) // *every 60 sec* refresh challenge data (score/duration updates and new deploys) 
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.gid = this.gameId || a.id),
      tap(() => this.isLoading = true),
      switchMap(() => this.playerApi.observeTeams(this.gid)) // tomorrow do this instead of players
    ).subscribe(data => {
      const queryTerm = route.snapshot.queryParams?.search?.toLowerCase()?.trim();
      this.searchText = queryTerm;
      this.typing$.next(this.searchText);

      this.updateTable(data);
      this.isLoading = false;
    });
    this.fetchActors$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 10_000) // *every 10 sec* refresh which users are one which consoles 
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.gid = this.gameId || a.id),
      switchMap(() => this.api.consoleActors(this.gid)),
      map(data => new Map(data.map(i => [i.userId, i])))
    );
    this.term$ = this.typing$.pipe(debounceTime(500));
  }

  public ngOnInit(): void {
    this.isLegacyMode = !this.gameId;
  }

  updateTable(data: Team[]) {
    for (let updatedTeam of data) {
      if (this.table.has(updatedTeam.teamId)) {
        // modify fields with updates values without resetting the entire challenge object
        let team = this.table.get(updatedTeam.teamId)!;
        team.rank = updatedTeam.rank;
        team.score = updatedTeam.score;
        team.time = updatedTeam.time;
      } else {
        this.table.set(updatedTeam.teamId, { ...updatedTeam } as unknown as ObserveTeam);
      }
      if (updatedTeam.rank > this.maxRank)
        this.maxRank = updatedTeam.rank;
    }
  }

  ngOnDestroy(): void {
    this.tableData.unsubscribe();
    this.gameData.unsubscribe();
  }

  go(member: ObserveTeamMember): void {
    this.conf.openConsole(`?f=0&o=1&u=${member.id}`);
  }

  toggleShowConsole(player: ObserveTeam) {
    player.expanded = !player.expanded;
  }

  togglePinRow(player: ObserveTeam) {
    player.pinned = !player.pinned;
  }

  toggleFullWidth(player: ObserveTeamMember) {
    player.fullWidth = !player.fullWidth;
  }

  toggleMinimize(member: ObserveTeamMember) {
    member.minimized = !member.minimized;
  }

  minimizeAllOthers(user: ObserveTeamMember, team: ObserveTeam): void {
    for (let member of team?.members || []) {
      if (member.id != user.id)
        member.minimized = true;
    }
  }

  // TrackBy Function to only reload rows when needed
  // Helpful for inserting new player row asynchronously without reloading existing rows
  trackByTeamId(_index: number, challengeItem: KeyValue<string, ObserveTeam>) {
    return challengeItem.value.teamId;
  }

  // Order by ApprovedName (team name)
  // I.E. Sort alphabetically by Team Name
  // Note: this is the same sorting done on the server, however this is needed for inserting new rows asynchronously in order.
  sortByName(a: KeyValue<string, ObserveTeam>, b: KeyValue<string, ObserveTeam>) {
    if (a.value.approvedName < b.value.approvedName) return -1;
    if (a.value.approvedName > b.value.approvedName) return 1;
    return 0;
  }
}
