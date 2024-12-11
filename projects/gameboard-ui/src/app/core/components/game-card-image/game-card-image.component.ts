import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-card-image',
  styles: [
    ":host { aspect-ratio: 1/1.44; display: block; }",
    ".game-card-container { aspect-ratio: 1/1.44; background: #303030 center center/contain no-repeat; background-position: contain }"
  ],
  templateUrl: './game-card-image.component.html'
})
export class GameCardImageComponent {
  @Input() game?: { id: string; name: string; logo?: string };
}
