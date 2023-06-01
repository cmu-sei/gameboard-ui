// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { faArrowLeft, faCaretDown, faCaretRight, faCloudUploadAlt, faCopy, faGamepad, faToggleOff, faToggleOn, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ConfigService } from '../../utility/config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { AppTitleService } from '@/services/app-title.service';

@Component({
  selector: 'app-game-editor',
  templateUrl: './game-editor.component.html',
  styleUrls: ['./game-editor.component.scss']
})
export class GameEditorComponent implements AfterViewInit {
  @Input() game!: Game;
  @ViewChild(NgForm) form!: FormGroup;

  game$: Observable<Game>;
  loaded$!: Observable<Game>;
  updated$!: Observable<boolean>;
  dirty = false;
  refreshFeedback = false;
  feedbackMessage?: string = undefined;
  feedbackWarning: boolean = false;
  viewing = 1;
  showCertificateInfo = false;

  // the first time we flip the mode to external, suggest the gamebrainhost endpoint as the external startup
  // url
  private defaultExternalGameStartUrlSuggested = false;

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

  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faCopy = faCopy;
  faTrash = faTrash;
  faSave = faCloudUploadAlt;
  faGo = faGamepad;
  faArrowLeft = faArrowLeft;
  faInfoCircle = faInfoCircle;

  constructor(
    // private router: Router,
    private api: GameService,
    private config: ConfigService,
    private title: AppTitleService,
    route: ActivatedRoute
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
        this.title.set(`Edit "${g.name}"`)
        this.updateFeedbackMessage();
      })
    );
  }

  ngAfterViewInit(): void {

    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !this.form.pristine && (this.form.valid || false)),
      tap(g => this.dirty = true),
      tap(r => {
        // the first time we flip to "External" mode, if the external game start url isn't specified,
        // default it to gamebrain's url in settings
        if (this.config.gamebrainhost && !this.game.externalGameStartupUrl && !this.defaultExternalGameStartUrlSuggested) {
          this.game.externalGameStartupUrl = `${this.config.gamebrainhost}admin/deploy`;
          this.defaultExternalGameStartUrlSuggested = true;
        }
      }),
      debounceTime(500),
      switchMap(g => this.api.update(this.game)),
      tap(r => this.dirty = false),
      filter(f => this.refreshFeedback),
      switchMap(g => this.api.retrieve(this.game.id).pipe(
        tap(game => {
          this.game.feedbackTemplate = game.feedbackTemplate;
          this.updateFeedbackMessage();
          this.refreshFeedback = false;
        }))
      ),
      map(g => false)
    );

  }

  yamlChanged() {
    this.refreshFeedback = true;
  }

  show(i: number): void {
    this.viewing = i !== this.viewing ? i : 0;
  }

  upload(files: File[], type: string): void {
    this.api.uploadImage(this.game.id, type, files[0]).subscribe(
      r => {
        this.game.logo = r.filename;
        this.game.cardUrl = `${this.config.imagehost}/${r.filename}`;
      }
    );
  }

  clearImage(): void {
    this.api.deleteImage(this.game.id, 'card').subscribe(
      r => {
        this.game.logo = r.filename;
        this.game.cardUrl = `${this.config.basehref}assets/card.png`;
      }
    );
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

  updateFeedbackMessage() {
    this.feedbackWarning = false;
    if (!this.game.feedbackConfig || this.game.feedbackConfig.trim().length == 0) {
      this.feedbackMessage = "No questions configured";
    } else if (this.game.feedbackTemplate) {
      if (!this.checkFeedbackIds()) {
        this.feedbackMessage = "IDs not unique in each list";
        this.feedbackWarning = true;
      } else {
        this.feedbackMessage = `${this.game.feedbackTemplate?.game?.length ?? 0} game, ${this.game.feedbackTemplate?.challenge?.length ?? 0} challenge questions configured`;
      }
    } else {
      this.feedbackMessage = "Invalid YAML format";
      this.feedbackWarning = true;
    }
  }

  checkFeedbackIds(): boolean {
    const boardIds = new Set(this.game.feedbackTemplate.game?.map(q => q.id));
    const challengeIds = new Set(this.game.feedbackTemplate.challenge?.map(q => q.id));
    if ([...boardIds].length != (this.game.feedbackTemplate.game?.length ?? 0) || [...challengeIds].length != (this.game.feedbackTemplate.challenge?.length ?? 0)) {
      return false;
    }
    return true;
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
