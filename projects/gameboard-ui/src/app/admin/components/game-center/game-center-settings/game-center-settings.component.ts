import { KeyValue } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { debounceTime, filter, firstValueFrom, switchMap, tap } from 'rxjs';
import { FeedbackTemplate } from '@/api/feedback-models';
import { ExternalGameHost, Game, GameEngineMode, GameRegistrationType } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { fa } from '@/services/font-awesome.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { YamlService } from '@/services/yaml.service';
import { ToastService } from '@/utility/services/toast.service';
import { ActivatedRoute } from '@angular/router';

export type SelectedSubTab = "settings" | "modes" | "registration";

@Component({
  selector: 'app-game-center-settings',
  templateUrl: './game-center-settings.component.html',
  styleUrls: ['./game-center-settings.component.scss']
})
export class GameCenterSettingsComponent implements AfterViewInit {
  @ViewChild(NgForm) form?: FormGroup;

  private gameId?: string;
  private needsPracticeModeEnabledRefresh = false;

  protected fa = fa;
  protected game?: Game;
  protected isDirty = false;
  protected selectedSubTab?: SelectedSubTab = "settings";
  protected showCertificateInfo = false;
  protected suggestions = {
    competition: new Map<string, number>(),
    track: new Map<string, number>(),
    season: new Map<string, number>(),
    division: new Map<string, number>(),
    cardText1: new Map<string, number>(),
    cardText2: new Map<string, number>(),
    cardText3: new Map<string, number>()
  };

  constructor(
    private gameService: GameService,
    private practiceService: PracticeService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private unsub: UnsubscriberService,
    private yamlService: YamlService) {
    this.unsub.add(this.route.data.subscribe(d => this.handleGameChange(d.gameId)));
  }

  ngAfterViewInit(): void {
    if (!this.form)
      throw new Error("Couldn't resolve the editor form.");

    this.unsub.add(
      this.form.valueChanges.pipe(
        filter(f => !!this.form && !this.form.pristine && (this.form.valid || false) && !!this.game && this.doAdditionalValidation(f)),
        tap(values => {
          this.isDirty = true;
          this.needsPracticeModeEnabledRefresh = values.playerMode !== this.game!.playerMode;
        }),
        debounceTime(500),
        switchMap(g => this.gameService.update(this.game!)),
        tap(r => this.isDirty = false),
        filter(f => this.needsPracticeModeEnabledRefresh),
        switchMap(g => this.gameService.retrieve(this.game!.id).pipe(
          tap(game => {
            if (this.needsPracticeModeEnabledRefresh) {
              this.practiceService.gamePlayerModeChanged({ gameId: game.id, isPractice: game.isPracticeMode });
              this.needsPracticeModeEnabledRefresh = false;
            }
          }))
        )
      ).subscribe()
    );
  }

  async handleExternalGameHostChanged(host: ExternalGameHost) {
    if (!this.game)
      throw new Error("Game is required");

    if (this.game.mode == "external" && this.game.externalHostId != host.id) {
      this.game.externalHostId = host.id;
      await firstValueFrom(this.gameService.update(this.game));
      this.toastService.showMessage(`Changed to host **${host.name}**`);
    }
  }

  protected async handleFeedbackTemplateChange(template?: FeedbackTemplate) {
    if (!this.game)
      throw new Error("Game is required");

    if (template) {
      this.game.feedbackConfig = this.yamlService.render(template);
      this.game.feedbackTemplate = template;
    }
    else {
      this.game.feedbackConfig = "";
      this.game.feedbackTemplate = undefined;
    }

    await firstValueFrom(this.gameService.update(this.game));
  }

  protected async handleModeChange(event: Event) {
    if (!this.game)
      throw new Error("Game is required.");

    const gameMode = ((event?.target as any).value as GameEngineMode);
    this.game.mode = gameMode;

    if (this.game.mode != "external")
      this.game.externalHostId = undefined;

    await firstValueFrom(this.gameService.update(this.game));
  }

  protected async clearImage() {
    if (!this.game)
      throw new Error("Game is required");

    await this.gameService.deleteGameCardImage(this.game.id);
    this.game.logo = "";
  }

  protected sortByCount(a: KeyValue<string, number>, b: KeyValue<string, number>) {
    // order DESC by occurrence count
    if (a.value < b.value) return 1;
    if (a.value > b.value) return -1;

    // order ASC alphabetically by name for occurrence tie
    if (a.key < b.key) return -1;
    if (a.key > b.key) return 1;
    return 0;
  }

  protected handleTabSelect(tab: SelectedSubTab) {
    if (tab === this.selectedSubTab) {
      this.selectedSubTab = undefined;
      return;
    }

    this.selectedSubTab = tab;
  }

  protected upload(files: File[], type: string): void {
    if (!this.game)
      throw new Error("Game is required");

    this.gameService.uploadImage(this.game.id, type, files[0]).subscribe(
      r => this.game!.logo = r.filename
    );
  }

  private countGameField(fieldMap: Map<string, number>, value: string) {
    // if field value not blank, increment occurrence count by 1
    if (!!value)
      fieldMap.set(value, (fieldMap.get(value) ?? 0) + 1);
  }

  private doAdditionalValidation(game: Game) {
    if (game.minTeamSize > game.maxTeamSize)
      return false;

    if (game.gameStart > game.gameEnd)
      return false;

    if (game.registrationType == GameRegistrationType.open && game.registrationOpen > game.registrationClose)
      return false;

    return true;
  }

  private async handleGameChange(gameId?: string) {
    this.gameId = gameId;
    if (!this.gameId || this.gameId === this.game?.id)
      return;

    const games = await firstValueFrom(this.gameService.list({}));
    for (const game of games) {
      this.countGameField(this.suggestions.competition, game.competition);
      this.countGameField(this.suggestions.track, game.track);
      this.countGameField(this.suggestions.season, game.season);
      this.countGameField(this.suggestions.division, game.division);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
    }

    this.game = games.find(g => g.id === this.gameId);
  }
}
