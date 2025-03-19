import { Component, inject, input, output } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { firstValueFrom } from 'rxjs';
import { Game, ListGamesResponseGame } from '@/api/game-models';
import { CoreModule } from '@/core/core.module';
import { GameToMetadataTextPipe } from '@/core/pipes/game-to-metadata-text.pipe';
import { fa } from "@/services/font-awesome.service";
import { GameInfoBubblesComponent } from '@/standalone/games/components/game-info-bubbles/game-info-bubbles.component';
import { GameToGameCenterLinkPipe } from '@/admin/pipes/game-to-game-center-link.pipe';
import { GameService } from '@/api/game.service';
import { RouterService } from '@/services/router.service';
import { ThemeBgDirective } from '@/core/directives/theme-bg.directive';

@Component({
  selector: 'app-games-table-view',
  standalone: true,
  templateUrl: './games-table-view.component.html',
  styleUrl: './games-table-view.component.scss',
  imports: [
    BsDropdownModule,
    CoreModule,
    GameInfoBubblesComponent,
    GameToGameCenterLinkPipe,
    GameToMetadataTextPipe,
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
  private routerService = inject(RouterService);

  protected fa = fa;
  protected selectedGameIds: string[] = [];

  protected handeClone(game: ListGamesResponseGame) {
    this.cloneRequest.emit(game);
  }

  protected async handleCreate() {
    const newGame = await firstValueFrom(this.gamesService.create({ name: "New Game" } as Game));
    this.routerService.toGameCenter(newGame.id);
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
