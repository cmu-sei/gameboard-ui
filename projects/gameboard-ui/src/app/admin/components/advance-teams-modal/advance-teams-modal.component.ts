// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from "../../../core/core.module";
import { SimpleEntity } from '@/api/models';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { firstValueFrom } from 'rxjs';
import { TeamService } from '@/api/team.service';

@Component({
    selector: 'app-advance-teams-modal',
    imports: [CommonModule, CoreModule],
    templateUrl: './advance-teams-modal.component.html',
    styleUrls: ['./advance-teams-modal.component.scss']
})
export class AdvanceTeamsModalComponent implements OnInit {
  private gameService = inject(GameService);
  private teamService = inject(TeamService);

  game?: SimpleEntity;
  onConfirm?: (targetGame: SimpleEntity) => Promise<void>;
  teams: SimpleEntity[] = [];

  protected includeScores = false;
  protected selectedGame?: Game;
  protected targetGames: Game[] = [];

  async ngOnInit(): Promise<void> {
    this.targetGames = await firstValueFrom(this.gameService.list({ filter: ['advanceable'] }));
  }

  protected async handleConfirm() {
    if (!this.selectedGame) {
      return;
    }

    await this.teamService.advance({
      gameId: this.selectedGame.id,
      includeScores: this.includeScores,
      teamIds: this.teams.map(t => t.id)
    });

    if (this.onConfirm) {
      await this.onConfirm(this.selectedGame);
    }
  }
}
