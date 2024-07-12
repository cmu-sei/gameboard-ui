import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-center-observe',
  templateUrl: './game-center-observe.component.html',
})
export class GameCenterObserveComponent {
  @Input() gameId?: string;

  protected observeBy: "challenge" | "team" = "challenge";
}
