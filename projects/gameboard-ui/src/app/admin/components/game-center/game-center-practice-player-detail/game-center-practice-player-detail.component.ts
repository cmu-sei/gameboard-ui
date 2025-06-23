import { Component } from '@angular/core';
import { GameCenterPracticeChallengeSpec } from '../game-center.models';
import { SimpleEntity } from '@/api/models';

export interface GameCenterPracticePlayerDetailContext {
  id: string;
  name: string;
  game: SimpleEntity;
  totalAttempts: number;
  uniqueChallengeSpecs: number;
  challengeSpecs: GameCenterPracticeChallengeSpec[]
}

@Component({
    selector: 'app-game-center-practice-player-detail',
    templateUrl: './game-center-practice-player-detail.component.html',
    styleUrls: ['./game-center-practice-player-detail.component.scss'],
    standalone: false
})
export class GameCenterPracticePlayerDetailComponent {
  ctx?: GameCenterPracticePlayerDetailContext;
}
