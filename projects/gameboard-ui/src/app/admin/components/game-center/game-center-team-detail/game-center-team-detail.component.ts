import { Component, OnInit } from '@angular/core';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { firstValueFrom } from 'rxjs';
import { TeamChallenge } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { fa } from '@/services/font-awesome.service';
import { GameCenterTeamsResultsTeam } from '../game-center.models';
import { AdminService } from '@/api/admin.service';
import { ToastService } from '@/utility/services/toast.service';

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
    private adminService: AdminService,
    private modalService: ModalConfirmService,
    private playerService: PlayerService,
    private toastService: ToastService) { }

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

      this.teamChallenges = await firstValueFrom(
        this
          .playerService
          .getTeamChallenges(this.team.id)
      );

      this.isLoadingChallenges = false;
    }

    this.showChallengeYaml = isExpanding;
  }

  protected async approveName(playerId: string, args: { name: string, revisionReason: string }) {
    const finalName = args.name.trim();
    await this.adminService.approvePlayerName(playerId, args);

    const player = this.team.players.find(p => p.id === playerId);
    if (player) {
      player.pendingName = "";
      player.name = args.name;
    }

    if (this.team.captain.id === playerId)
      this.team.name = args.name;

    this.toastService.showMessage(`This player's name has been changed to **${args.name}**.${args.revisionReason ? ` (reason: **${args.revisionReason}**)` : ""}`);
  }
}
