// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { fa } from '@/services/font-awesome.service';
import { ScoringService } from '@/services/scoring/scoring.service';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ExternalSpec, NewSpec, Spec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';
import { ChallengeSpecScoringConfig, GameScoringConfig } from '@/services/scoring/scoring.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ToastService } from '@/utility/services/toast.service';
import { slug } from 'projects/gameboard-ui/src/tools/functions';

@Component({
  selector: 'app-game-mapper',
  templateUrl: './game-mapper.component.html',
  styleUrls: ['./game-mapper.component.scss']
})
export class GameMapperComponent {
  @Output() specsUpdated = new EventEmitter<Spec[]>();
  @ViewChild('mapbox') mapboxRef!: ElementRef;

  protected fa = fa;
  specConfigMap: { [specId: string]: ChallengeSpecScoringConfig } = {};

  gameBonusesConfig$: Observable<GameScoringConfig>;
  refresh$ = new Subject<string | null | undefined>();
  updating$ = new Subject<Spec>();
  deleting$ = new Subject<Spec>();
  recentExternals$ = new Subject<void>();
  updated$: Observable<Spec>;
  recentExternalSpecList$: Observable<ExternalSpec[]>;

  viewing = 'edit';

  protected game?: Game;
  protected hasZeroPointSpecs = false;
  protected isSynchronizing = false;
  protected specs: Spec[] = [];
  protected syncErrors: any[] = [];

  constructor(
    private api: SpecService,
    private gameSvc: GameService,
    private config: ConfigService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private unsub: UnsubscriberService,
    scoringService: ScoringService
  ) {
    this.gameBonusesConfig$ = this.refresh$.pipe(
      debounceTime(500),
      filter(gId => !!gId),
      switchMap(id => scoringService.getGameScoringConfig(id!)),
      tap(config => {
        this.specConfigMap = {};

        if (!config)
          return;

        for (let specConfig of config.specs) {
          this.specConfigMap[specConfig.id] = specConfig;
        }
      })
    );

    this.unsub.add(this.refresh$.pipe(distinctUntilChanged()).subscribe(async gameId => await this.loadGameData(gameId)));

    // Grabs external specs
    this.recentExternalSpecList$ = this.recentExternals$.pipe(
      debounceTime(500),
      // Get a list of the external specs in the API and iterate through each
      switchMap(() => api.list('')),
      tap(extSpecArr => {
        extSpecArr.forEach(
          extSpec => {
            // Find the one in the local list that matches this one
            var item = this.specs.find(i => i.externalId === extSpec.externalId);

            // Compare the name and description of each; if they aren't equal, update the challenge in the GB database
            if (item) {
              var tmpName = item.name;
              var tmpDesc = item.description;
              item.name = extSpec.name;
              item.description = extSpec.description;
              if (tmpName != extSpec.name || tmpDesc != extSpec.description) api.update(item).subscribe();
            }
          });
      })
    );
    this.recentExternalSpecList$.subscribe();

    this.updated$ = this.updating$.pipe(
      debounceTime(500),
      filter(s => s.points === 0 || s.points > 0),
      switchMap(s => api.update(s)),
      tap(s => this.refresh())
    );

    this.unsub.add(this.route.data.subscribe(d => this.refresh$.next(d.gameId)));
  }

  refresh(): void {
    this.refresh$.next(this.route.snapshot.data.gameId);
    this.recentExternals$.next();
  }

  view(v: string): void {
    this.viewing = v;
  }

  async upload(files: File[]) {
    if (!this.game)
      return;

    const result = await firstValueFrom(this.gameSvc.uploadImage(this.game.id, "map", files[0]));
    this.updateGameMapImage(result.filename);
  }

  async clearImage() {
    if (!this.game)
      return;

    const result = await firstValueFrom(this.gameSvc.deleteImage(this.game.id, "map"));
    this.updateGameMapImage(result.filename);
  }

  handleBonusesChanged() {
    this.refresh();
  }

  async sync(): Promise<void> {
    this.syncErrors = [];

    this.isSynchronizing = true;
    if (!this.game)
      return;

    try {
      await firstValueFrom(this.api.sync(this.game.id));
      this.toastService.showMessage("**Synchronized** specs with the game engine.");
      this.refresh();
    }
    catch (err: any) {
      this.syncErrors.push(err);
    }

    this.isSynchronizing = false;
  }

  protected async handleSpecSelect(spec: ExternalSpec) {
    if (this.specs.find(s => s.externalId == spec.externalId)) {
      this.toastService.showMessage(`An instance of **${spec.name}** has already been added to this game.`);
      return;
    }

    if (!spec?.externalId)
      return;

    const newSpec: NewSpec = {
      averageDeploySeconds: 10,
      ...spec,
      disabled: false,
      gameId: this.game!.id,
      isHidden: false,
      points: 100,
      c: "",
      // if x and y are zero, the API will create semi-random coordinates to they don't stack up
      x: 0,
      y: 0,
      r: 0.015,
      tag: slug(spec.name),
    };

    await firstValueFrom(this.api.create(newSpec));
    await this.reloadSpecs();
    this.toastService.showMessage(`Added challenge ${newSpec.name} to the game.`);
  }

  protected async handleSpecDeleteRequested(specId: string) {
    await firstValueFrom(this.api.delete(specId));
    await this.reloadSpecs();
  }

  protected handleSpecUpdated(spec: Spec) {
    this.checkForZeroPointActiveSpecs(this.specs);
    this.specsUpdated.emit(this.specs);
  }

  private checkForZeroPointActiveSpecs(specs: Spec[]) {
    this.hasZeroPointSpecs = specs.some(s => s.points <= 0);
  }

  private async loadGameData(gameId: string | null | undefined) {
    if (!gameId) {
      this.game = undefined;
      this.specs = [];
      return;
    }

    if (this.game?.id == gameId) {
      await this.reloadSpecs();
      return;
    }

    this.game = await firstValueFrom(this.gameSvc.retrieve(gameId));
    await this.reloadSpecs();
  }

  private async reloadSpecs() {
    if (!this.game?.id)
      return;

    this.specs = await firstValueFrom(this.gameSvc.retrieveSpecs(this.game.id));
    this.checkForZeroPointActiveSpecs(this.specs);
  }

  private updateGameMapImage(imagePath: string) {
    if (!this.game)
      return;

    this.game.background = imagePath;
    this.game.mapUrl = `${this.config.basehref}assets/map.png`;
  }
}
