import { Component, Input, OnInit } from '@angular/core';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { AdminService } from '@/api/admin.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { AdminEnrollTeamModalComponent } from '../../admin-enroll-team-modal/admin-enroll-team-modal.component';
import { fa } from '@/services/font-awesome.service';
import { ManageManualChallengeBonusesModalComponent } from '../../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { SimpleEntity } from '@/api/models';
import { GameCenterTeamsAdvancementFilter, GameCenterTeamSessionStatus, GameCenterTeamsResults, GameCenterTeamsSort } from '../game-center.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-game-center-players',
  templateUrl: './game-center-players.component.html',
  styleUrls: ['./game-center-players.component.scss']
})
export class GameCenterPlayersComponent implements OnInit {
  @Input() gameId?: string;

  protected fa = fa;
  protected game?: Game;
  protected isLoading = false;
  protected results?: GameCenterTeamsResults;

  // search/sort/filter
  protected advancementFilter?: GameCenterTeamsAdvancementFilter;
  protected searchInput$ = new Subject<Event>();
  protected searchTerm = "";
  protected sessionStatus?: GameCenterTeamSessionStatus;
  protected sort: GameCenterTeamsSort = 'rank';

  constructor(
    private adminService: AdminService,
    private gameService: GameService,
    private modalService: ModalConfirmService,
    private toastService: ToastService,
    private unsub: UnsubscriberService) {

    this.unsub.add(this.searchInput$.pipe(
      debounceTime(300)
    ).subscribe(async event => {
      this.searchTerm = (event.target as HTMLInputElement).value;
      this.load();
    })
    );
  }

  async ngOnInit(): Promise<void> {
    if (!this.gameId)
      throw new Error("Component requires a gameId");

    this.game = await firstValueFrom(this.gameService.retrieve(this.gameId));
    await this.load();
  }

  // protected exportCsv(list: Player[]): void {
  //   const a = (this.selected.length ? this.selected : list)
  //     .map(p => this.asCsv(p));
  //   const hdr = 'GameId,TeamId,TeamName,PlayerId,UserId,UserName,Rank,Score,Time,Correct,Partial,SessionBegin,SessionEnd\n';
  //   this.clipboard.copyToClipboard(hdr + a.join('\n'));
  // }

  protected manageManualBonuses(team: SimpleEntity) {
    this.modalService.openComponent<ManageManualChallengeBonusesModalComponent>({
      content: ManageManualChallengeBonusesModalComponent,
      context: {
        gameName: this.game?.name,
        playerName: team.name,
        teamId: team.id
      }
    });
  }

  protected handlePlayerAddClick(game: Game) {
    this.modalService.openComponent({
      content: AdminEnrollTeamModalComponent,
      context: {
        game: game,
        onConfirm: async result => {
          this.toastService.showMessage(`Enrolled **${result.name}** in the game.`);
          await this.load();
        }
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected async load() {
    if (!this.gameId)
      throw new Error("gameId is required.");

    this.isLoading = true;
    this.results = await this.adminService.getGameCenterTeams(this.gameId, {
      advancement: this.advancementFilter,
      search: this.searchTerm,
      sessionStatus: this.sessionStatus,
      sort: this.sort
    });
    this.isLoading = false;
  }
}
