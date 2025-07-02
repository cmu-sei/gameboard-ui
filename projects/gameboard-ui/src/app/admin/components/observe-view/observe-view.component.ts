import { Component, effect, inject, input, model, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ConsoleComponentConfig, ConsoleTileComponent } from '@cmusei/console-forge';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ListConsolesRequest, ListConsolesRequestSort, ListConsolesResponseConsole, ListConsolesResponseTeam } from '@/api/consoles.models';
import { ConsolesService } from '@/api/consoles.service';
import { SimpleEntity } from '@/api/models';
import { PlayerMode } from '@/api/player-models';
import { SpecService } from '@/api/spec.service';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

interface ObserveViewTeam {
  team: ListConsolesResponseTeam;
  consoles: {
    consoleData: ListConsolesResponseConsole;
    appUrl: string;
    config: ConsoleComponentConfig;
  }[];
}

@Component({
  selector: 'app-observe-view',
  imports: [
    FormsModule,
    ConsoleTileComponent,
    FontAwesomeModule,
    SpinnerComponent,
  ],
  templateUrl: './observe-view.component.html',
  styleUrl: './observe-view.component.scss'
})
export class ObserveViewComponent {
  public gameId = input<string>();
  public playerMode = input<PlayerMode>();

  private readonly challengeSpecsService = inject(SpecService);
  private readonly consolesService = inject(ConsolesService);
  private readonly routerService = inject(RouterService);

  protected fa = fa;
  protected isLoading = signal<boolean>(false);
  private readonly searchInput$ = new Subject<string>();

  protected readonly challengeSpecs = signal<SimpleEntity[]>([]);
  protected readonly searchText = model<string>("");
  protected readonly selectedChallengeSpecId = model<string>("");
  protected readonly sortBy = model<ListConsolesRequestSort>("rank");
  protected readonly teams = signal<ObserveViewTeam[]>([]);

  constructor() {
    effect(() => {
      // declare effect signal dependencies explicitly. we want to do this when the game changes,
      // but not when the search text or other dependent signals change (because gameId is a route parameter)
      const gameId = this.gameId();
      const playerMode = this.playerMode();

      const untrackedSignalParams = untracked(() => ({
        selectedChallengeSpecId: this.selectedChallengeSpecId(),
        searchText: this.searchText(),
        sortBy: this.sortBy(),
      }));

      this.loadConsoles({
        gameId,
        challengeSpecId: untrackedSignalParams.selectedChallengeSpecId,
        playerMode: playerMode,
        searchTerm: untrackedSignalParams.searchText,
        sortBy: untrackedSignalParams.sortBy,
      });

      if (gameId) {
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
      playerMode: this.playerMode(),
      challengeSpecId: this.selectedChallengeSpecId(),
      searchTerm: this.searchText(),
      sortBy: this.sortBy()
    });
  }

  private async loadConsoles(request: ListConsolesRequest): Promise<void> {
    // this endpoint sends down the consoles as a list, but we want to group by team
    this.isLoading.update(() => true);
    const response = await this.consolesService.listConsoles(request);
    const teamsToPush = new Map<string, ObserveViewTeam>();

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
