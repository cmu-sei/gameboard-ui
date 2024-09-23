import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-game-center-observe',
  templateUrl: './game-center-observe.component.html',
})
export class GameCenterObserveComponent {
  protected gameId?: string;

  protected observeBy: "challenge" | "team" = "challenge";
  constructor(
    route$: ActivatedRoute,
    private unsub: UnsubscriberService) {
    unsub.add(route$.data.subscribe(d => this.gameId = d.gameId));
  }
}
