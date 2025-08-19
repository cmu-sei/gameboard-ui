import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { firstValueFrom } from 'rxjs';
import { GameToGameCenterLinkPipe } from '@/admin/pipes/game-to-game-center-link.pipe';
import { Game, ListGamesResponseGame } from '@/api/game-models';
import { CoreModule } from '@/core/core.module';
import { GameToMetadataTextPipe } from '@/core/pipes/game-to-metadata-text.pipe';
import { GameInfoBubblesComponent } from '@/standalone/games/components/game-info-bubbles/game-info-bubbles.component';
import { GameService } from '@/api/game.service';
import { ThemeBgDirective } from '@/core/directives/theme-bg.directive';
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-games-table-view',
  templateUrl: './games-table-view.component.html',
  styleUrl: './games-table-view.component.scss',
  imports: [
    BsDropdownModule,
    CoreModule,
    GameInfoBubblesComponent,
    GameToGameCenterLinkPipe,
    GameToMetadataTextPipe,
    PluralizerPipe,
    ThemeBgDirective
  ]
})
export class GamesTableViewComponent {
  cloneRequest = output<ListGamesResponseGame>();
  deleteRequest = output<ListGamesResponseGame>();
  exportRequest = output<string[]>();

  games = input.required<ListGamesResponseGame[], ListGamesResponseGame[]>({
    transform: (value: ListGamesResponseGame[]) => {
      if (!value) {
        return [];
      }

      value.sort((a, b) => a.name.localeCompare(b.name));
      return value;
    }
  });

  private gamesService = inject(GameService);
  private router = inject(Router);
  private routerService = inject(RouterService);

  protected fa = fa;
  protected selectedGameIds: string[] = [];

  protected handleClone(game: ListGamesResponseGame) {
    this.cloneRequest.emit(game);
  }

  protected async handleCreate() {
    const newGame = await firstValueFrom(this.gamesService.create({ name: "New Game" } as Game));
    this.routerService.toGameCenter(newGame.id, "settings");
  }

  protected handleDeleteRequest(game: ListGamesResponseGame) {
    this.deleteRequest.emit(game);
  }

  protected handleExportRequest(game: ListGamesResponseGame) {
    this.exportRequest.emit([game.id]);
  }

  protected handleExportSelected() {
    if (this.selectedGameIds.length) {
      this.exportRequest.emit(this.selectedGameIds);
    }
  }

  protected handleSelectAll() {
    if (this.selectedGameIds.length == this.games().length) {
      this.selectedGameIds = [];
    } else {
      this.selectedGameIds = this.games().map(g => g.id);
    }
  }

  protected handleSelect(gameId: string) {
    if (this.selectedGameIds.indexOf(gameId) >= 0) {
      this.selectedGameIds = this.selectedGameIds.filter(g => g != gameId);
    } else {
      this.selectedGameIds.push(gameId);
    }
  }
}
