import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-game-card-image',
  templateUrl: './game-card-image.component.html'
})
export class GameCardImageComponent {
  @Input() game?: { id: string; name: string; logo: string };
  @Input() width: string = "100%";
}
