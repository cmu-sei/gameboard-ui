// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ExternalGameHost, Game, GameEngineMode } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { KeyValue } from '@angular/common';
import { AppTitleService } from '@/services/app-title.service';
import { fa } from '@/services/font-awesome.service';
import { PlayerMode } from '@/api/player-models';
import { ToastService } from '@/utility/services/toast.service';
import { PracticeService } from '@/services/practice.service';
import { FeedbackTemplate } from '@/api/feedback-models';
import { Spec } from '@/api/spec-models';
import { YamlService } from '@/services/yaml.service';

@Component({
  selector: 'app-game-editor',
  templateUrl: './game-editor.component.html',
  styleUrls: ['./game-editor.component.scss']
})
export class GameEditorComponent implements AfterViewInit {
  @Input() game!: Game;
  @ViewChild(NgForm) form!: FormGroup;

  protected fa = fa;
  game$: Observable<Game>;
  loaded$!: Observable<Game>;
  updated$!: Observable<boolean>;
  dirty = false;
  needsPracticeModeEnabledRefresh = false;
  viewing = 1;
  showCertificateInfo = false;
  showExternalGameFields = false;
  protected specCount = 0;

  // store unique values of each game field with their frequencies for ordered suggestion lists
  suggestions = {
    competition: new Map<string, number>(),
    track: new Map<string, number>(),
    season: new Map<string, number>(),
    division: new Map<string, number>(),
    cardText1: new Map<string, number>(),
    cardText2: new Map<string, number>(),
    cardText3: new Map<string, number>()
  };

  constructor(
    route: ActivatedRoute,
    private api: GameService,
    private practiceService: PracticeService,
    private title: AppTitleService,
    private toast: ToastService,
    private yamlService: YamlService
  ) {

    // one-time get list of all games for field suggestions
    api.list({}).subscribe(
      games => this.addSuggestions(games)
    );

    this.game$ = route.params.pipe(
      map(p => p.id),
      filter(id => !!id),
      switchMap(id => api.retrieve(id)),
      tap(g => {
        this.game = g;
        this.title.set(`Edit "${g.name}"`);

        // ensure that the feedback template yaml string is consistent with the configuration
        if (this.game.feedbackConfig) {
          this.game.feedbackTemplate = this.yamlService.parse(this.game.feedbackConfig);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !this.form.pristine && (this.form.valid || false)),
      tap(values => {
        this.dirty = true;
        this.needsPracticeModeEnabledRefresh = values.playerMode !== this.game.playerMode;
      }),
      debounceTime(500),
      switchMap(g => this.api.update(this.game)),
      tap(r => this.dirty = false),
      filter(f => this.needsPracticeModeEnabledRefresh),
      switchMap(g => this.api.retrieve(this.game.id).pipe(
        tap(game => {
          if (this.needsPracticeModeEnabledRefresh) {
            this.practiceService.gamePlayerModeChanged({ gameId: game.id, isPractice: game.isPracticeMode });
            this.needsPracticeModeEnabledRefresh = false;
          }
        }))
      ),
      map(g => false)
    );
  }

  async handleExternalGameHostChanged(host: ExternalGameHost) {
    if (this.game.mode == "external" && this.game.externalHostId != host.id) {
      this.game.externalHostId = host.id;
      await firstValueFrom(this.api.update(this.game));
      this.toast.showMessage(`Changed to host **${host.name}**`);
    }
  }

  async handleFeedbackTemplateChange(template?: FeedbackTemplate) {
    if (template) {
      this.game.feedbackConfig = this.yamlService.render(template);
      this.game.feedbackTemplate = template;
    }
    else {
      this.game.feedbackConfig = "";
      this.game.feedbackTemplate = undefined;
    }

    await firstValueFrom(this.api.update(this.game));
  }

  async handleModeChange(event: Event) {
    const gameMode = ((event?.target as any).value as GameEngineMode);
    this.game.mode = gameMode;

    if (this.game.mode != "external")
      this.game.externalHostId = undefined;

    await firstValueFrom(this.api.update(this.game));
  }

  protected handleSpecsUpdated(specs: Spec[]) {
    this.specCount = specs.length;
  }

  show(i: number): void {
    this.viewing = i !== this.viewing ? i : 0;
  }

  upload(files: File[], type: string): void {
    this.api.uploadImage(this.game.id, type, files[0]).subscribe(
      r => this.game.logo = r.filename
    );
  }

  async clearImage() {
    await this.api.deleteGameCardImage(this.game.id);
    this.game.logo = "";
  }

  addSuggestions(games: Game[]) {
    // add properties of each game into respective map to record distinct values and maintain counts
    for (const game of games) {
      this.countGameField(this.suggestions.competition, game.competition);
      this.countGameField(this.suggestions.track, game.track);
      this.countGameField(this.suggestions.season, game.season);
      this.countGameField(this.suggestions.division, game.division);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
      this.countGameField(this.suggestions.cardText1, game.cardText1);
    }
  }

  countGameField(fieldMap: Map<string, number>, value: string) {
    // if field value not blank, increment occurrence count by 1
    if (!!value)
      fieldMap.set(value, (fieldMap.get(value) ?? 0) + 1);
  }

  sortByCount(a: KeyValue<string, number>, b: KeyValue<string, number>) {
    // order DESC by occurrence count
    if (a.value < b.value) return 1;
    if (a.value > b.value) return -1;

    // order ASC alphabetically by name for occurrence tie
    if (a.key < b.key) return -1;
    if (a.key > b.key) return 1;
    return 0;
  }
}
