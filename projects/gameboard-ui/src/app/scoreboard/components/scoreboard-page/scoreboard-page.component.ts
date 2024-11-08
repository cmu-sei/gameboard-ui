import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { GameService } from '@/api/game.service';
import { SimpleEntity } from '@/api/models';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-scoreboard-page',
  providers: [UnsubscriberService],
  templateUrl: './scoreboard-page.component.html',
  styleUrls: ['./scoreboard-page.component.scss']
})
export class ScoreboardPageComponent {
  protected game?: SimpleEntity;

  constructor(
    private appTitle: AppTitleService,
    private gameService: GameService,
    private route: ActivatedRoute,
    private unsub: UnsubscriberService) {
    this.unsub.add(this.route.params.subscribe(async params => this.loadGame(params.gameId)));
  }

  private async loadGame(gameId: string) {
    if (!gameId) {
      this.game = undefined;
      return;
    }

    this.game = await firstValueFrom(this.gameService.retrieve(gameId));
    this.appTitle.set(`Scoreboard | ${this.game.name}`);
  }
}
