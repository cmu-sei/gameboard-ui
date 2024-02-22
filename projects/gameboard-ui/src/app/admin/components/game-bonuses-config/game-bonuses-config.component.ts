import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LogService } from '../../../services/log.service';
import { ScoringService } from '../../../services/scoring/scoring.service';
import { ToastService } from '../../../utility/services/toast.service';
import { GameScoringConfig, UpdateGameAutoChallengeBonusConfig } from '@/services/scoring/scoring.models';
import { YamlService } from '@/services/yaml.service';

@Component({
  selector: 'app-game-bonuses-config',
  templateUrl: './game-bonuses-config.component.html',
  styleUrls: ['./game-bonuses-config.component.scss']
})
export class GameBonusesConfigComponent implements OnInit, OnChanges {
  @Input() isEnabled = false;
  @Input() gameId?: string;
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<string>();

  protected config?: GameScoringConfig;
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
    if (!this.gameId) {
      this.log.logError("Can't load the game bonuses config component without a Game input.");
      return;
    }

    const yamlKey = "auto-bonuses";
    const sample = await this.yaml.loadSample(yamlKey);

    if (sample) {
      this.textPlaceholder = sample;
      this.textPlaceholderRows = !this.textPlaceholder ? 8 : this.textPlaceholder?.split("\n").length + 4;
    }
    else {
      this.log.logError(`Couldn't load sample YAML for "${yamlKey}".`);
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.gameId) {

      await this.loadConfig(this.gameId);
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
    if (!this.gameId) {
      this.log.logError("Can't import bonus configurations without a gameId.");
      return;
    }

    if (this.yamlIn) {
      this.errors = [];
      this.isLoading = true;

      try {
        const configUpdate = this.yaml.parse<UpdateGameAutoChallengeBonusConfig>(this.yamlIn);
        const newConfig = await this.scoringService.updateGameAutoChallengeBonuses(this.gameId, configUpdate);
        this.bindConfig(newConfig);
        this.update.emit(this.gameId);
        this.isLoading = false;

        // compute how many specs actually got a bonus
        const updatedSpecCount = newConfig.specs.filter(specConfig => specConfig.possibleBonuses.length > 0).length;

        // and notify
        this.toastsService.showMessage(`Configured ${updatedSpecCount} challenge${updatedSpecCount == 1 ? "" : "s"} with ${newConfig.specs.map(c => c.possibleBonuses.length).reduce((prev, current) => prev + current)} total bonuses 👍`);
      }
      catch (err: any) {
        this.errors.push(err);
      }

      this.isLoading = false;
    }
  }

  async handleDeleteClick(gameId: string) {
    this.isLoading = true;
    await this.scoringService.deleteGameAutoChallengeBonuses(gameId);
    this.yamlIn = undefined;

    //reload
    await this.loadConfig(gameId);
    this.isLoading = false;
    this.delete.emit(gameId);
  }

  private bindConfig(config: GameScoringConfig) {
    this.config = config;
    this.hasBonusesConfigured = config.specs.some(c => c.possibleBonuses.length);
    if (this.hasBonusesConfigured) {
      this.yamlIn = this.renderConfigAsYaml(config);
    }
  }

  private async loadConfig(gameId: string) {
    const config = await firstValueFrom(this.scoringService.getGameScoringConfig(gameId));
    this.bindConfig(config);
  }

  private renderConfigAsYaml(config: GameScoringConfig) {
    if (!config)
      return "";

    // we can't really distinguish game-level challenges vs. single-challenge
    // ones here without a bunch of rigamarole, so just render them as 
    // specific challenge bonuses
    const configuredBonuses: UpdateGameAutoChallengeBonusConfig = {
      allChallengesBonuses: [],
      specificChallengesBonuses: []
    };

    for (const spec of config.specs) {
      configuredBonuses.specificChallengesBonuses.push(...spec.possibleBonuses.map(b => ({
        supportKey: spec.supportKey,
        description: b.description,
        pointValue: b.pointValue,
        solveRank: ("solveRank" in b) ? b.solveRank as number : 0
      })));
    }

    return this.yaml.render(configuredBonuses);
  }
}
