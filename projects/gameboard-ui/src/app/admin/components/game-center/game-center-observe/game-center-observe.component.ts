import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PlayerMode } from '@/api/player-models';

@Component({
  selector: 'app-game-center-observe',
  templateUrl: './game-center-observe.component.html',
  styleUrl: "./game-center-observe.component.scss",
  standalone: false
})
export class GameCenterObserveComponent {
  private readonly route = inject(ActivatedRoute);
  protected gameId = toSignal(this.route.data.pipe(map(d => d.gameId)));
  protected playerMode = PlayerMode.competition;
}
