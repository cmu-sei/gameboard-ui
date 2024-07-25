import { Component, OnInit } from '@angular/core';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SimpleEntity } from '@/api/models';
import { first, firstValueFrom } from 'rxjs';
import { Player, TeamChallenge } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { fa } from '@/services/font-awesome.service';
import { GameCenterTeamsResultsTeam } from '../game-center.models';

@Component({
  selector: 'app-game-center-team-detail',
  templateUrl: './game-center-team-detail.component.html',
  styleUrls: ['./game-center-team-detail.component.scss']
})
export class GameCenterTeamDetailComponent implements OnInit {
  game!: {
    id: string;
    name: string;
    isTeamGame: boolean;
  };

  team!: GameCenterTeamsResultsTeam;

  protected durationExtensionInMinutes?: number;
  protected isExtending = false;
  protected isLoading = false;
  protected isLoadingChallenges = false;
  protected fa = fa;
  protected showChallengeYaml = false;
  protected teamChallenges: TeamChallenge[] = [];
  protected reasons: string[] = [
    'disallowed',
    'disallowed_pii',
    'disallowed_unit',
    'disallowed_agency',
    'disallowed_explicit',
    'disallowed_innuendo',
    'disallowed_excessive_emojis',
    'not_unique'
  ];

  constructor(
    private modalService: ModalConfirmService,
    private playerService: PlayerService) { }

  public ngOnInit() {
    if (!this.game)
      throw new Error("Game is required");

    if (!this.team)
      throw new Error("Team is required");
  }

  protected extendByDuration(team: GameCenterTeamsResultsTeam, extensionInMinutes?: number) {
    if (!extensionInMinutes) {
      return;
    }

    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        extensionInMinutes: extensionInMinutes,
        game: this.game,
        teamIds: [team.id]
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected openExtendModal(gameId: string) {
    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        extensionInMinutes: 30,
        game: {
          id: gameId,
          name: this.game.name,
          isTeamGame: this.game.isTeamGame
        },
        teamIds: [this.team.id]
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async toggleRawView(isExpanding: boolean) {
    if (isExpanding) {
      this.isLoadingChallenges = true;

      const challenges = await firstValueFrom(
        this
          .playerService
          .getTeamChallenges(this.team.id)
      );

      this.isLoadingChallenges = false;
    }

    this.showChallengeYaml = isExpanding;
  }

  protected async update(model: Player) {
    await firstValueFrom(this.playerService.update(model));
  }
}
