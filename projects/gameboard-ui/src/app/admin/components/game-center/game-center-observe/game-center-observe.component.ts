import { Component, effect, inject, model, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsolesService } from '@/api/consoles.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, Subject } from 'rxjs';
import { ConsoleComponentConfig } from '@cmusei/console-forge';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { ListConsolesRequest, ListConsolesRequestSort, ListConsolesResponseConsole, ListConsolesResponseTeam } from '@/api/consoles.models';
import { SpecService } from '@/api/spec.service';
import { SimpleEntity } from '@/api/models';

interface GameCenterObserveTeam {
  team: ListConsolesResponseTeam;
  consoles: {
    consoleData: ListConsolesResponseConsole;
    appUrl: string;
    config: ConsoleComponentConfig;
  }[];
}

@Component({
  selector: 'app-game-center-observe',
  templateUrl: './game-center-observe.component.html',
  styleUrl: "./game-center-observe.component.scss",
  standalone: false
})
export class GameCenterObserveComponent {
  private readonly challengeSpecsService = inject(SpecService);
  private readonly consolesService = inject(ConsolesService);
  private readonly route = inject(ActivatedRoute);
  private readonly routerService = inject(RouterService);

  protected fa = fa;
  protected gameId = toSignal(this.route.data.pipe(map(d => d.gameId)));
  protected isLoading = signal<boolean>(false);
  private readonly searchInput$ = new Subject<string>();

  protected readonly challengeSpecs = signal<SimpleEntity[]>([]);
  protected readonly searchText = model<string>("");
  protected readonly selectedChallengeSpecId = model<string>("");
  protected readonly sortBy = model<ListConsolesRequestSort>("rank");
  protected readonly teams = signal<GameCenterObserveTeam[]>([]);

  constructor() {
    effect(() => {
      // declare effect signal dependencies explicitly. we want to do this when the game changes,
      // but not when the search text or other dependent signals change (because gameId is a route parameter)
      const gameId = this.gameId();
      const untrackedSignalParams = untracked(() => ({
        selectedChallengeSpecId: this.selectedChallengeSpecId(),
        searchText: this.searchText(),
        sortBy: this.sortBy(),
      }));

      if (this.gameId()) {
        this.loadConsoles({
          gameId,
          challengeSpecId: untrackedSignalParams.selectedChallengeSpecId,
          searchTerm: untrackedSignalParams.searchText,
          sortBy: untrackedSignalParams.sortBy,
        });
        this.loadSpecs(gameId);
      }
    });

    this.searchInput$.pipe(
      debounceTime(1000),
      takeUntilDestroyed()
    ).subscribe(async () => await this.loadConsolesWithSelectedParams());
  }

  protected handleSearchBoxInput() {
    this.searchInput$.next(this.searchText());
  }

  protected loadConsolesWithSelectedParams() {
    return this.loadConsoles({
      gameId: this.gameId(),
      challengeSpecId: this.selectedChallengeSpecId(),
      searchTerm: this.searchText(),
      sortBy: this.sortBy()
    });
  }

  private async loadConsoles(request: ListConsolesRequest): Promise<void> {
    // this endpoint sends down the consoles as a list, but we want to group by team
    this.isLoading.update(() => true);
    const response = await this.consolesService.listConsoles(request);
    const teamsToPush = new Map<string, GameCenterObserveTeam>();

    for (const console of response.consoles) {
      const consoleConfig: ConsoleComponentConfig = {
        autoFocusOnConnect: false,
        credentials: { accessTicket: console.accessTicket },
        url: console.url
      };
      const consoleAppUrl = this.routerService.buildVmConsoleUrl(console.consoleId.challengeId, console.consoleId.name).toString();

      if (teamsToPush.has(console.team.id)) {
        teamsToPush.get(console.team.id)!.consoles.push({
          appUrl: consoleAppUrl,
          config: consoleConfig,
          consoleData: console,
        });
      } else {
        teamsToPush.set(console.team.id, {
          team: console.team,
          consoles: [{
            appUrl: consoleAppUrl,
            config: consoleConfig,
            consoleData: console
          }]
        });
      }
    }

    this.teams.update(() => [...teamsToPush.values()]);
    this.isLoading.update(() => false);
  }

  private async loadSpecs(gameId: string) {
    const gameSpecs = await this.challengeSpecsService.listByGame(gameId);
    this.challengeSpecs.update(() => gameSpecs.find(g => g.game.id === gameId)?.challengeSpecs || []);
  }
}
