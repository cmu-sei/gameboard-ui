// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ExternalSpec, NewSpec, Spec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';
import { fa } from '@/services/font-awesome.service';
import { ChallengeSpecScoringConfig, GameScoringConfig } from '@/services/scoring/scoring.models';
import { ScoringService } from '@/services/scoring/scoring.service';

@Component({
  selector: 'app-game-mapper',
  templateUrl: './game-mapper.component.html',
  styleUrls: ['./game-mapper.component.scss']
})
export class GameMapperComponent implements OnInit, AfterViewInit {
  @Input() game!: Game;
  @ViewChild('mapbox') mapboxRef!: ElementRef;
  @ViewChild('callout') calloutRef!: ElementRef;

  protected fa = fa;
  mapbox!: HTMLDivElement;
  callout!: HTMLDivElement;
  specDrag: Spec | null = null;
  specHover: Spec | null = null;
  altkey = false;
  showGrid = false;
  showCallout = false;
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

  constructor(
    private api: SpecService,
    private gameSvc: GameService,
    private renderer: Renderer2,
    private config: ConfigService,
    scoringService: ScoringService
  ) {
    this.list$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(id => gameSvc.retrieveSpecs(id)),
      tap(r => this.list = r),
      tap(r => this.checkForZeroPointActiveSpecs(r))
    );

    this.gameBonusesConfig$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(id => scoringService.getGameScoringConfig(id)),
      tap(config => {
        this.specConfigMap = {};

        if (!config)
          return;

        for (let specConfig of config.challengeSpecScoringConfigs) {
          this.specConfigMap[specConfig.challengeSpec.id] = specConfig;
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
      map(s => ({ ...s, gameId: this.game.id, points: 0, x: .5, y: .5, r: .015 } as NewSpec)),
      switchMap(s => api.create(s)),
      tap(r => this.list.push(r)),
      tap(r => this.addedCount += 1)
    );

    this.updated$ = this.updating$.pipe(
      debounceTime(500),
      filter(s => s.points === 0 || s.points > 0),
      switchMap(s => api.update(s)),
      tap(s => this.refresh())
    );

    this.deleted$ = this.deleting$.pipe(
      switchMap(s => api.delete(s.id)),
      tap(() => this.refresh$.next(this.game.id))
    );
  }

  ngOnInit(): void {
    this.game.mapUrl = this.game.background
      ? `${this.config.imagehost}/${this.game.background}`
      : `${this.config.basehref}assets/map.png`
      ;
  }

  ngAfterViewInit(): void {
    this.refresh();
    this.mapbox = this.mapboxRef.nativeElement as HTMLDivElement;
    this.callout = this.calloutRef.nativeElement as HTMLDivElement;
  }

  refresh(): void {
    this.refresh$.next(this.game.id);
    this.recentExternals$.next();
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
    this.api.sync(this.game.id).subscribe(
      () => this.refresh()
    );
  }

  trackById(index: number, g: Spec): string {
    return g.id;
  }

  protected handleSpecUpdated(spec: Spec) {
    this.checkForZeroPointActiveSpecs(this.list);
  }

  private checkForZeroPointActiveSpecs(specs: Spec[]) {
    this.hasZeroPointSpecs = specs.some(s => s.points <= 0);
  }

  mousemove(e: MouseEvent) {
    if (!this.specDrag) { return; }

    if (this.altkey) {
      // resize radius as percentage of mapbox/svg
      const centerx = this.specDrag.x * this.mapbox.clientWidth;
      const centery = this.specDrag.y * this.mapbox.clientHeight;
      const deltaX = e.offsetX - centerx;
      const deltaY = e.offsetY - centery;
      const r = Math.sqrt(
        Math.pow(Math.abs(deltaX), 2) +
        Math.pow(Math.abs(deltaY), 2)
      );
      this.specDrag.r = Math.max(.01, r / this.mapbox.clientWidth);
    } else {
      // set location as percentage of mapbox/svg
      this.specDrag.x = e.offsetX / this.mapbox.clientWidth;
      this.specDrag.y = e.offsetY / this.mapbox.clientHeight;
    }

    this.updating$.next(this.specDrag);
  }

  mousedrag(e: MouseEvent, spec: Spec) {
    if (this.showCallout) { return; }
    this.specDrag = e.type === 'mousedown'
      ? spec
      : null
      ;
  }

  mouseenter(e: MouseEvent, spec: Spec) {
    this.specHover = spec;
    spec.c = 'purple';

    if (this.showCallout) {
      const middle = this.mapbox.clientWidth / 2;
      const centerr = spec.r * this.mapbox.clientWidth;
      const centerx = spec.x * this.mapbox.clientWidth + centerr;
      const centery = spec.y * this.mapbox.clientHeight + centerr;
      const deltaX = middle - centerx;
      const deltaY = middle - centery;
      const vectorX = deltaX / Math.abs(deltaX);
      const vectorY = deltaY / Math.abs(deltaY);
      let left = 0, top = 0, right = 0, bottom = 0;
      if (vectorX > 0) {
        left = centerx + centerr;
        if (vectorY > 0) {
          top = centery + centerr;
        } else {
          bottom = middle * 2 - centery + (2 * centerr);
        }
      } else {
        right = middle * 2 - centerx + (2 * centerr);
        if (vectorY > 0) {
          top = centery + centerr;
        } else {
          bottom = middle * 2 - centery + (2 * centerr);
        }
      }

      if (!!left) {
        this.renderer.setStyle(this.callout, 'left', left + 'px');
      } else {
        this.renderer.removeStyle(this.callout, 'left');
      }
      if (!!top) {
        this.renderer.setStyle(this.callout, 'top', top + 'px');
      } else {
        this.renderer.removeStyle(this.callout, 'top');
      }
      if (!!right) {
        this.renderer.setStyle(this.callout, 'right', right + 'px');
      } else {
        this.renderer.removeStyle(this.callout, 'right');
      }
      if (!!bottom) {
        this.renderer.setStyle(this.callout, 'bottom', bottom + 'px');
      } else {
        this.renderer.removeStyle(this.callout, 'bottom');
      }
    }
  }

  mouseleave(e: MouseEvent, spec: Spec) {
    this.specHover = null;
    spec.c = 'blue';
  }

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:keyup', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    this.altkey = ev.altKey;
  }
}
