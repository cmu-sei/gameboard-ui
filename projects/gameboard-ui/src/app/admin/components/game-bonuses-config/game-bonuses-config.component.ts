import { Component, Input, OnInit } from '@angular/core';
import { YamlService } from '../../../services/yaml.service';
import { Game } from '../../../api/game-models';
import { LogService } from '../../../services/log.service';
import { ScoringService } from '../../../services/scoring/scoring.service';
import { UpdateGameAutoChallengeBonusConfig } from '../../../api/scoring-models';
import { ToastService } from '../../../utility/services/toast.service';

@Component({
  selector: 'app-game-bonuses-config',
  templateUrl: './game-bonuses-config.component.html',
  styleUrls: ['./game-bonuses-config.component.scss']
})
export class GameBonusesConfigComponent implements OnInit {
  @Input() game?: Game;
  textPlaceholder: string | null = null;
  textPlaceholderRows = 8;
  yamlIn?: string;

  constructor(
    private log: LogService,
    private scoringService: ScoringService,
    private toastsService: ToastService,
    private yaml: YamlService) { }

  async ngOnInit(): Promise<void> {
    if (!this.game) {
      this.log.logError("Can't load the game bonuses config component without a Game input.");
      return;
    }

    this.textPlaceholder = await this.yaml.loadSample("game-automatic-bonuses");
    this.textPlaceholderRows = !this.textPlaceholder ? 8 : this.textPlaceholder?.split("\n").length + 4;
  }

  handlePasteExampleConfigClick() {
    if (this.textPlaceholder)
      this.yamlIn = this.textPlaceholder;
    else {
      this.toastsService.showMessage("Oops. Couldn't load the sample YAML. Sorry. 😭");
    }
  }

  async handleImportClick() {
    if (!this.game?.id) {
      this.log.logError("Can't import bonus configurations without a gameId.");
      return;
    }

    if (this.yamlIn) {
      const config = this.yaml.parse<UpdateGameAutoChallengeBonusConfig>(this.yamlIn);
      var gameConfig = await this.scoringService.updateGameAutoChallengeBonuses(this.game.id, config);
      this.log.logInfo(gameConfig);
    }
  }
}
