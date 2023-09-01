import { GameCardContext } from '@/api/game-models';
import { PracticeService } from '@/services/practice.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface PracticeChallengesContext {
  games: GameCardContext[];
  practiceModeIntroText: string;
}

@Component({
  selector: 'app-practice-challenges',
  templateUrl: './practice-challenges.component.html',
  styleUrls: ['./practice-challenges.component.scss']
})
export class PracticeChallengesComponent implements OnInit {
  protected ctx: PracticeChallengesContext | null = null;

  constructor(private practiceService: PracticeService) { }

  async ngOnInit(): Promise<void> {
    this.ctx = {
      games: await firstValueFrom(this.practiceService.listGames()),
      practiceModeIntroText: ""
    };
  }
}
