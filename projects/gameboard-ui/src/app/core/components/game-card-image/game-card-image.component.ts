import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-card-image',
  styleUrls: ["./game-card-image.component.scss"],
  templateUrl: './game-card-image.component.html'
})
export class GameCardImageComponent {
  @Input() game?: { id: string; name: string; logo?: string };
}
