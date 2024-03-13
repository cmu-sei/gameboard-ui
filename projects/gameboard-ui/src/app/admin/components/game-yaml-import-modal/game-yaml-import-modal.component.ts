import { NewGame } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { YamlService } from '@/services/yaml.service';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-yaml-import-modal',
  templateUrl: './game-yaml-import-modal.component.html',
  styleUrls: ['./game-yaml-import-modal.component.scss']
})
export class GameYamlImportModalComponent {
  onCreate?: (game: NewGame) => void | Promise<void>;
  protected errors: any[] = [];

  constructor(
    private gameService: GameService,
    private modalService: ModalConfirmService,
    private yamlService: YamlService) { }

  protected handleClose() {
    this.modalService.hide();
  }

  protected async handleImportClick(yamlIn: string) {
    this.errors = [];
    try {
      const game = this.yamlService.parse<NewGame>(yamlIn);
      await firstValueFrom(this.gameService.create(game));

      if (this.onCreate) {
        await this.onCreate(game);
      }
    }
    catch (err) {
      this.errors.push(err);
    }

    this.modalService.hide();
  }
}
