import { GameEngineMode } from '@/api/game-models';
import { SimpleEntity } from '@/api/models';
import { Component, Input } from '@angular/core';

interface PracticeCardContext {
  gameName: string;
  spec: SimpleEntity,
  engineMode: GameEngineMode
}

@Component({
  selector: 'app-practice-card',
  templateUrl: './practice-card.component.html',
  styleUrls: ['./practice-card.component.scss']
})
export class PracticeCardComponent {
  @Input() ctx: PracticeCardContext | null = null;
}
