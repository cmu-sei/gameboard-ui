import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { debounceTime, filter, firstValueFrom, Subject, switchMap } from 'rxjs';
import { GameService } from '@/api/game.service';
import { Spec } from '@/api/spec-models';
import { SpecService } from '@/api/spec.service';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-game-map-editor',
  templateUrl: './game-map-editor.component.html',
  styleUrls: ['./game-map-editor.component.scss']
})
export class GameMapEditorComponent implements OnInit {
  @Input() gameId!: string;
  @Output() mapUrlImageChange = new EventEmitter<{ gameId: string, mapImageUrl?: string }>();
  @ViewChild('mapbox') mapboxRef!: ElementRef;

  private isAltModifierDown = false;
  private updatingSpec$ = new Subject<Spec>();

  protected draggingSpec?: Spec;
  protected fa = fa;
  protected isGridVisible = false;
  protected mapImageUrl?: string;
  protected specs: Spec[] = [];

  constructor(
    private gameService: GameService,
    private specService: SpecService,
    private unsub: UnsubscriberService) {
    this.unsub.add(
      this.updatingSpec$
        .pipe(
          debounceTime(500),
          filter(s => !!s),
          switchMap(s => this.specService.update(s)),
        )
        .subscribe()
    );
  }

  async ngOnInit() {
    if (!this.gameId) {
      throw new Error("GameId is required");
    }

    this.specs = await firstValueFrom(this.gameService.retrieveSpecs(this.gameId));
    const game = await firstValueFrom(this.gameService.retrieve(this.gameId));
    this.mapImageUrl = game.background;
  }

  protected async mousemove(e: MouseEvent) {
    if (!this.draggingSpec)
      return;

    const mapBox = this.mapboxRef.nativeElement;

    if (this.isAltModifierDown) {
      // resize radius as percentage of mapbox/svg
      const centerx = this.draggingSpec.x * mapBox.clientWidth;
      const centery = this.draggingSpec.y * mapBox.clientHeight;
      const deltaX = e.offsetX - centerx;
      const deltaY = e.offsetY - centery;
      const r = Math.sqrt(
        Math.pow(Math.abs(deltaX), 2) +
        Math.pow(Math.abs(deltaY), 2)
      );
      this.draggingSpec.r = Math.max(.01, r / mapBox.clientWidth);
    } else {
      // set location as percentage of mapbox/svg
      this.draggingSpec.x = e.offsetX / mapBox.clientWidth;
      this.draggingSpec.y = e.offsetY / mapBox.clientHeight;
    }

    this.updatingSpec$.next(this.draggingSpec);
  }

  mousedrag(e: MouseEvent, spec: Spec) {
    this.draggingSpec = e.type === 'mousedown' ? spec : undefined;
  }

  mouseenter(e: MouseEvent, spec: Spec) {
    spec.c = 'purple';
  }

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:keyup', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    this.isAltModifierDown = ev.altKey;
  }

  protected async clearImage(gameId: string) {
    await this.gameService.deleteMapImage(gameId);
    this.mapUrlImageChange.emit({ gameId, mapImageUrl: undefined });
    this.mapImageUrl = undefined;
  }

  protected async uploadMapImage(gameId: string, files: File[]) {
    if (!files.length)
      throw new Error("No files supplied for upload");

    const result = await this.gameService.updateMapImage(this.gameId, files[0]);
    this.mapUrlImageChange.emit({ gameId, mapImageUrl: result.filename });
    this.mapImageUrl = result.filename;
  }
}
