// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ExternalSpec, NewSpec, Spec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';
import { fa } from '@/services/font-awesome.service';
import { ChallengeSpecScoringConfig, GameScoringConfig } from '@/services/scoring/scoring.models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { ToastService } from '@/utility/services/toast.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

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
  created$: Observable<Spec>;
  deleted$: Observable<any>;
  recentExternalSpecList$: Observable<ExternalSpec[]>;

  show = false;
  viewing = 'edit';
  addedCount = 0;

  protected game?: Game;
  protected hasZeroPointSpecs = false;
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

    this.created$ = api.selected$.pipe(
      filter(s => !this.specs.find(i => i.externalId === s.externalId)),
      filter(s => !!this.game),
      map(s => {
        // compute semi-random coordinates for the new spec so it doesn't sit on top of other
        // added specs
        const randomX = Math.random() * 0.5 + 0.25;
        const randomY = Math.random() * 0.5 + 0.25;
        return { ...s, gameId: this.game!.id, points: 1, x: randomX, y: randomY, r: .015 } as NewSpec;
      }),
      switchMap(s => api.create(s)),
      tap(r => this.addedCount += 1),
      tap(s => this.refresh()),
    );

    this.updated$ = this.updating$.pipe(
      debounceTime(500),
      filter(s => s.points === 0 || s.points > 0),
      switchMap(s => api.update(s)),
      tap(s => this.refresh())
    );

    this.deleted$ = this.deleting$.pipe(
      filter(s => !!this.game?.id),
      switchMap(s => api.delete(s.id)),
      tap(() => this.refresh()),
    );

    this.unsub.add(this.route.data.subscribe(d => this.refresh$.next(d.gameId)));
  }

  refresh(): void {
    this.refresh$.next(this.route.snapshot.data.gameId);
    this.recentExternals$.next();
  }

  view(v: string): void {
    this.viewing = v;
    if (v === 'edit') {
      this.addedCount = 0;
    }
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

  sync(): void {
    this.syncErrors = [];
    if (!this.game)
      return;

    try {
      this.api.sync(this.game.id).subscribe(() => this.refresh());
      this.toastService.showMessage("Synchronized specs with the game engine.");
    }
    catch (err: any) {
      this.syncErrors.push(err);
    }
  }

  trackById(index: number, g: Spec): string {
    return g.id;
  }

  protected handleSpecUpdated(spec: Spec) {
    this.specs = [...this.specs.filter(s => s.id !== spec.id), spec];
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
      await this.updateSpecs(gameId);
      return;
    }

    this.game = await firstValueFrom(this.gameSvc.retrieve(gameId));
    await this.updateSpecs(gameId);
  }

  private async updateSpecs(gameId?: string) {
    if (!gameId) {
      this.specs = [];
      return;
    }

    this.specs = await firstValueFrom(this.gameSvc.retrieveSpecs(gameId));
    this.checkForZeroPointActiveSpecs(this.specs);
  }

  private updateGameMapImage(imagePath: string) {
    if (!this.game)
      return;

    this.game.background = imagePath;
    this.game.mapUrl = `${this.config.basehref}assets/map.png`;
  }
}
