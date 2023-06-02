import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { YamlService } from '../../../services/yaml.service';
import { Game } from '../../../api/game-models';
import { LogService } from '../../../services/log.service';
import { ScoringService } from '../../../services/scoring/scoring.service';
import { UpdateGameAutoChallengeBonusConfig } from '../../../api/scoring-models';
import { ToastService } from '../../../utility/services/toast.service';
import { GameScoringConfig } from '@/services/scoring/scoring.models';

@Component({
  selector: 'app-game-bonuses-config',
  templateUrl: './game-bonuses-config.component.html',
  styleUrls: ['./game-bonuses-config.component.scss']
})
export class GameBonusesConfigComponent implements OnInit, OnChanges {
  @Input() game?: Game;
  @Input() gameScoringConfig: GameScoringConfig | null = null;
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<string>();

  configInputsVisible = false;
  hasBonusesConfigured = false;
  isLoading = false;
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

    const yamlKey = "game-automatic-bonuses";
    const sample = await this.yaml.loadSample(yamlKey);

    if (sample) {
      this.textPlaceholder = sample;
      this.textPlaceholderRows = !this.textPlaceholder ? 8 : this.textPlaceholder?.split("\n").length + 4;
    }
    else {
      this.log.logError(`Couldn't load sample YAML for "${yamlKey}".`);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.gameScoringConfig.currentValue) {
      const change = changes.gameScoringConfig;
      this.hasBonusesConfigured = (change.currentValue as unknown as GameScoringConfig).challengeSpecScoringConfigs.some(c => c.possibleBonuses.length);
      this.configInputsVisible = !this.hasBonusesConfigured;
    }
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
      this.isLoading = true;
      var gameConfig = await this.scoringService.updateGameAutoChallengeBonuses(this.game.id, config);
      this.update.emit(this.game.id);
      this.isLoading = false;
      this.toastsService.showMessage(`Configured ${gameConfig.challengeSpecScoringConfigs.length} challenges with ${gameConfig.challengeSpecScoringConfigs.map(c => c.possibleBonuses.length).reduce((prev, current) => prev + current)} total bonuses 👍`);
    }
  }

  async handleDeleteClick(gameId: string) {
    this.isLoading = true;
    await this.scoringService.deleteGameAutoChallengeBonuses(gameId);
    this.isLoading = false;
    this.delete.emit(gameId);
  }
}
