// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ExternalSpec, NewSpec, Spec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';
import { fa } from '@/services/font-awesome.service';
import { ChallengeSpecScoringConfig, GameScoringConfig } from '@/services/scoring/scoring.models';
import { ScoringService } from '@/services/scoring/scoring.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
  selector: 'app-game-mapper',
  templateUrl: './game-mapper.component.html',
  styleUrls: ['./game-mapper.component.scss']
})
export class GameMapperComponent implements OnInit, AfterViewInit {
  @Input() game!: Game;
  @Output() specsUpdated = new EventEmitter<Spec[]>();
  @ViewChild('mapbox') mapboxRef!: ElementRef;

  protected fa = fa;
  specConfigMap: { [specId: string]: ChallengeSpecScoringConfig } = {};

  gameBonusesConfig$: Observable<GameScoringConfig>;
  refresh$ = new Subject<string>();
  updating$ = new Subject<Spec>();
  deleting$ = new Subject<Spec>();
  recentExternals$ = new Subject<void>();
  updated$: Observable<Spec>;
  created$: Observable<Spec>;
  deleted$: Observable<any>;
  list$: Observable<Spec[]>;
  recentExternalSpecList$: Observable<ExternalSpec[]>;
  list: Spec[] = [];

  show = false;
  viewing = 'edit';
  addedCount = 0;

  protected hasZeroPointSpecs = false;
  protected syncErrors: any[] = [];

  constructor(
    private api: SpecService,
    private gameSvc: GameService,
    private config: ConfigService,
    private toastService: ToastService,
    scoringService: ScoringService
  ) {
    this.list$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(id => gameSvc.retrieveSpecs(id)),
      tap(r => this.list = r),
      tap(r => this.checkForZeroPointActiveSpecs(r)),
      tap(r => this.specsUpdated.emit(r))
    );

    this.gameBonusesConfig$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(id => scoringService.getGameScoringConfig(id)),
      tap(config => {
        this.specConfigMap = {};

        if (!config)
          return;

        for (let specConfig of config.specs) {
          this.specConfigMap[specConfig.id] = specConfig;
        }
      })
    );

    // Grabs external specs
    this.recentExternalSpecList$ = this.recentExternals$.pipe(
      debounceTime(500),
      // Get a list of the external specs in the API and iterate through each
      switchMap(() => api.list('')),
      tap(extSpecArr => {
        extSpecArr.forEach(
          extSpec => {
            // Find the one in the local list that matches this one
            var item = this.list.find(i => i.externalId === extSpec.externalId);

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
      filter(s => !this.list.find(i => i.externalId === s.externalId)),
      map(s => {
        // compute semi-random coordinates for the new spec so it doesn't sit on top of other
        // added specs
        const randomX = Math.random() * 0.5 + 0.25;
        const randomY = Math.random() * 0.5 + 0.25;
        return { ...s, gameId: this.game.id, points: 1, x: randomX, y: randomY, r: .015 } as NewSpec;
      }),
      switchMap(s => api.create(s)),
      tap(r => this.list.push(r)),
      tap(r => this.addedCount += 1),
      tap(s => this.refresh()),
    );

    this.updated$ = this.updating$.pipe(
      debounceTime(500),
      filter(s => s.points === 0 || s.points > 0),
      switchMap(s => api.update(s)),
      tap(s => this.refresh()),
    );

    this.deleted$ = this.deleting$.pipe(
      switchMap(s => api.delete(s.id)),
      tap(() => this.refresh$.next(this.game.id)),
    );
  }

  async ngOnInit(): Promise<void> {
    if (!this.game?.id)
      this.game = await firstValueFrom(this.gameSvc.retrieve(this.game.id));

    this.game.mapUrl = this.game.background
      ? `${this.config.imagehost}/${this.game.background}`
      : `${this.config.basehref}assets/map.png`
      ;
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (this.game?.id) {
      this.refresh$.next(this.game.id);
      this.recentExternals$.next();
    }
  }

  view(v: string): void {
    this.viewing = v;
    if (v === 'edit') {
      this.addedCount = 0;
    }
  }

  upload(files: File[]): void {
    this.gameSvc.uploadImage(this.game.id, 'map', files[0]).subscribe(
      r => {
        this.game.background = r.filename;
        this.game.mapUrl = `${this.config.imagehost}/${r.filename}`;
      }
    );
  }

  clearImage(): void {
    this.gameSvc.deleteImage(this.game.id, 'map').subscribe(
      r => {
        this.game.background = r.filename;
        this.game.mapUrl = `${this.config.basehref}assets/map.png`;
      }
    );
  }

  handleBonusesChanged() {
    this.refresh();
  }

  sync(): void {
    this.syncErrors = [];

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
    this.list = [...this.list.filter(s => s.id !== spec.id), spec];
    this.checkForZeroPointActiveSpecs(this.list);
    this.specsUpdated.emit(this.list);
  }

  private checkForZeroPointActiveSpecs(specs: Spec[]) {
    this.hasZeroPointSpecs = specs.some(s => s.points <= 0);
  }
}
