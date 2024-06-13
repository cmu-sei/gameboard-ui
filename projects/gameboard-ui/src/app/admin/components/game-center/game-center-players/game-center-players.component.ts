import { Component, Input, OnInit } from '@angular/core';
import { GameCenterTeamsResults } from '@/api/admin.models';
import { AdminService } from '@/api/admin.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-center-players',
  templateUrl: './game-center-players.component.html',
  styleUrls: ['./game-center-players.component.scss']
})
export class GameCenterPlayersComponent implements OnInit {
  @Input() gameId?: string;

  protected game?: Game;
  protected isLoading = false;
  protected results?: GameCenterTeamsResults;

  constructor(
    private adminService: AdminService,
    private gameService: GameService) { }

  async ngOnInit(): Promise<void> {
    if (!this.gameId)
      throw new Error("Component requires a gameId");

    this.game = await firstValueFrom(this.gameService.retrieve(this.gameId));
    await this.load();
  }

  private async load() {
    this.isLoading = true;
    this.results = await this.adminService.getGameCenterTeams(this.gameId!);
    this.isLoading = false;
  }
}
