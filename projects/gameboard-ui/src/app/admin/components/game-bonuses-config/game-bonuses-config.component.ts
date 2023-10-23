import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { YamlService } from '../../../services/yaml.service';
import { Game } from '../../../api/game-models';
import { LogService } from '../../../services/log.service';
import { ScoringService } from '../../../services/scoring/scoring.service';
import { ToastService } from '../../../utility/services/toast.service';
import { GameScoringConfig, UpdateGameAutoChallengeBonusConfig } from '@/services/scoring/scoring.models';

@Component({
  selector: 'app-game-bonuses-config',
  templateUrl: './game-bonuses-config.component.html',
  styleUrls: ['./game-bonuses-config.component.scss']
})
export class GameBonusesConfigComponent implements OnInit, OnChanges {
  @Input() isEnabled = false;
  @Input() game?: Game;
  @Input() gameScoringConfig: GameScoringConfig | null = null;
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<string>();

  protected configInputsVisible = false;
  protected errors: any[] = [];
  protected hasBonusesConfigured = false;
  protected isLoading = false;
  protected textPlaceholder: string | null = null;
  protected textPlaceholderRows = 8;
  protected yamlIn?: string;

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
    if (changes.gameScoringConfig?.currentValue) {
      const change = changes.gameScoringConfig;
      this.hasBonusesConfigured = (change.currentValue as unknown as GameScoringConfig).specs.some(c => c.possibleBonuses.length);
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
      this.errors = [];

      try {
        const config = this.yaml.parse<UpdateGameAutoChallengeBonusConfig>(this.yamlIn);
        this.isLoading = true;
        var gameConfig = await this.scoringService.updateGameAutoChallengeBonuses(this.game.id, config);
        this.update.emit(this.game.id);
        this.yamlIn = undefined;
        this.isLoading = false;

        // compute how many specs actually got a bonus
        const updatedSpecCount = gameConfig.specs.filter(specConfig => specConfig.possibleBonuses.length > 0).length;

        // and notify
        this.toastsService.showMessage(`Configured ${updatedSpecCount} challenge${updatedSpecCount == 1 ? "" : "s"} with ${gameConfig.specs.map(c => c.possibleBonuses.length).reduce((prev, current) => prev + current)} total bonuses 👍`);
      }
      catch (err: any) {
        this.errors.push(err);
      }
    }
  }

  async handleDeleteClick(gameId: string) {
    this.isLoading = true;
    await this.scoringService.deleteGameAutoChallengeBonuses(gameId);
    this.isLoading = false;
    this.delete.emit(gameId);
  }
}
