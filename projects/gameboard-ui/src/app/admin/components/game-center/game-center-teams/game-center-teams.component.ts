import { Component, Input, OnInit } from '@angular/core';
import { debounceTime, firstValueFrom, map, Subject, tap } from 'rxjs';
import { AdminService } from '@/api/admin.service';
import { fa } from '@/services/font-awesome.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { AdminEnrollTeamModalComponent } from '../../admin-enroll-team-modal/admin-enroll-team-modal.component';
import { ManageManualChallengeBonusesModalComponent } from '../../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { SimpleEntity } from '@/api/models';
import { GameCenterTeamsAdvancementFilter, GameCenterTeamSessionStatus, GameCenterTeamsResults, GameCenterTeamsSort } from '../game-center.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { unique } from 'projects/gameboard-ui/src/tools';
import { ScoreboardTeamDetailModalComponent } from '@/scoreboard/components/scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { PlayerService } from '@/api/player.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';
import { NowService } from '@/services/now.service';
import { GameCenterTeamDetailComponent } from '../game-center-team-detail/game-center-team-detail.component';
import { TeamService } from '@/api/team.service';
import { GameCenterPlayerNameManagementComponent } from '../game-center-player-name-management/game-center-player-name-management.component';

interface GameCenterTeamsFilterSettings {
  advancement?: GameCenterTeamsAdvancementFilter;
  searchTerm?: string;
  hasPendingNames?: boolean;
  sort?: GameCenterTeamsSort;
  sessionStatus?: GameCenterTeamSessionStatus;
}

@Component({
  selector: 'app-game-center-teams',
  templateUrl: './game-center-teams.component.html',
  styleUrls: ['./game-center-teams.component.scss']
})
export class GameCenterTeamsComponent implements OnInit {
  @Input() gameId?: string;

  protected fa = fa;
  protected game?: Game;
  protected isLoading = false;
  protected results?: GameCenterTeamsResults;
  protected selectedTeamIds: string[] = [];

  // search/sort/filter
  protected filterSettings: GameCenterTeamsFilterSettings = { sort: 'rank' };
  protected searchInput$ = new Subject<Event>();

  constructor(
    private adminService: AdminService,
    private clipboardService: ClipboardService,
    private gameService: GameService,
    private localStorageClient: LocalStorageService,
    private modalService: ModalConfirmService,
    private nowService: NowService,
    private playerService: PlayerService,
    private teamService: TeamService,
    private toastService: ToastService,
    private unsub: UnsubscriberService) {

    this.unsub.add(
      this.searchInput$.pipe(
        debounceTime(300)
      ).subscribe(async event => {
        this.filterSettings.searchTerm = (event.target as HTMLInputElement).value;
        this.load();
      }),
      this.teamService.teamSessionExtended$.subscribe(async teamIds => {
        for (const teamId of teamIds) {
          if (this.results?.teams?.items?.find(t => t.id === teamId)) {
            await this.load();
            return;
          }
        }
      })
    );
  }

  async ngOnInit(): Promise<void> {
    if (!this.gameId)
      throw new Error("Component requires a gameId");

    this.game = await firstValueFrom(this.gameService.retrieve(this.gameId));
    this.filterSettings = this.localStorageClient.getAs<GameCenterTeamsFilterSettings>(StorageKey.GameCenterTeamsFilterSettings, this.filterSettings);
    await this.load();
  }

  protected async handleClearAllFilters() {
    this.filterSettings.advancement = undefined;
    this.filterSettings.searchTerm = "";
    this.filterSettings.sort = "rank";
    this.filterSettings.sessionStatus = undefined;
    await this.load();
  }

  protected async handleDeployGameResources() {
    if (!this.results || !this.gameId)
      return;

    const teamIds = this.selectedTeamIds.length ? this.selectedTeamIds : this.results.teams.items.map(t => t.id);
    const invalidTeamNames: string[] = [];
    const validTeamIds: string[] = [];

    const nowish = this.nowService.nowToMsEpoch();
    for (const team of this.results.teams.items) {
      if (this.selectedTeamIds.length && this.selectedTeamIds.indexOf(team.id) < 0)
        continue;

      if (team.session.end && team.session.end < nowish)
        invalidTeamNames.push(team.name);
      else
        validTeamIds.push(team.id);
    }

    if (!validTeamIds.length) {
      this.modalService.openConfirm({
        bodyContent: "All selected teams have finished their sessions, so no resources can be deployed for them.",
        hideCancel: true,
        title: "All teams finished",
        subtitle: this.game?.name
      });

      return;
    }

    let appendInvalidTeamsClause = "";
    if (invalidTeamNames.length) {
      appendInvalidTeamsClause = `\n\nSessions for some teams have ended, so their resources won't be deployed:\n\n${invalidTeamNames.map(tId => `- ${tId}\n`)}`;
    }

    this.modalService.openConfirm({
      bodyContent: `Are you sure you want to deploy resources for ${validTeamIds.length} teams?${appendInvalidTeamsClause}`,
      onConfirm: async () => {
        if (!validTeamIds.length)
          return;

        await this.gameService.deployResources(this.gameId!, validTeamIds);
        this.toastService.showMessage(`Deploying resources for **${validTeamIds.length} ${this.game?.isTeamGame ? "team" : "player"}(s)**.`);
        this.selectedTeamIds = [];
      },
      renderBodyAsMarkdown: true,
      subtitle: this.game?.name,
      title: "Deploy game resources"
    });
  }

  protected async handleExportCsvData(selectedTeamIds: string[]) {
    if (!this.gameId)
      throw new Error("GameId is required.");

    const hdr = 'GameId,TeamId,TeamName,PlayerId,UserId,UserName,Rank,Score,Time,Correct,Partial,SessionBegin,SessionEnd\n';
    var players = await this.adminService.getPlayersExport(this.gameId, selectedTeamIds.length ? selectedTeamIds : undefined);
    this.clipboardService.copy(hdr + players
      .map(p => `${p.game.id},${p.team.id},${p.name.replace(',', '-')},${p.id},${p.user.id},${p.user.name.replace(',', '-')},${p.rank},${p.score},${p.timeMs},${p.solvesCorrectCount},${p.solvesPartialCount},${p.session.start || ""},${p.session.end || ""}`)
      .join("\n")
    );

    this.toastService.showMessage(`Copied CSV data for **${this.selectedTeamIds.length ? players.length : "all"} players** to your clipboard.`);
  }

  protected handleExportMailMetaData(): void {
    if (!this.gameId)
      throw new Error("Requires gameId");

    this.playerService.getTeams(this.gameId)
      .pipe(
        map(r => r.filter(s => this.selectedTeamIds?.length === 0 || this.selectedTeamIds.indexOf(s.id) >= 0))
      )
      .subscribe(data => {
        this.clipboardService.copy(JSON.stringify(data, null, 2));
      });

    this.toastService.showMessage(`Copied mail metadata for **${this.selectedTeamIds.length ? this.selectedTeamIds.length : "all"} ${this.game?.isTeamGame ? "teams" : "players"}** to your clipboard.`);
  }

  protected handleExtendClick(selectedTeamIds: string[]) {
    if (!this.game)
      throw new Error("Game is required");

    this.modalService.openComponent({
      content: ExtendTeamsModalComponent,
      context: {
        game: this.game,
        teamIds: selectedTeamIds
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async handlePendingNamesClick(gameId: string) {
    this.filterSettings.hasPendingNames = true;
    await this.load();
  }

  protected async handleRerankClick(gameId: string) {
    await firstValueFrom(this.gameService.rerank(gameId));
    await this.load();
    this.toastService.showMessage(`${this.game?.name} has been **reranked**!`);
  }

  protected handleSelectAll() {
    if (!this.results)
      return;

    if (this.selectedTeamIds.length === this.results.teams.items.length) {
      this.selectedTeamIds = [];
    } else {
      this.selectedTeamIds = this.results.teams.items.map(t => t.id);
    }
  }

  protected handleTeamScoreClick(teamId: string) {
    this.modalService.openComponent({
      content: ScoreboardTeamDetailModalComponent,
      context: { teamId },
      modalClasses: ["modal-lg"]
    });
  }

  protected handleTeamClick(teamId: string) {
    const team = this.results?.teams.items.find(t => t.id === teamId);

    this.modalService.openComponent({
      content: GameCenterTeamDetailComponent,
      context: {
        team,
        game: this.game
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected handleTeamSelected(event: { isSelected: boolean, teamId: string }) {
    if (event.isSelected)
      this.selectedTeamIds = unique([...this.selectedTeamIds.concat(event.teamId)]);
    else
      this.selectedTeamIds = [...this.selectedTeamIds.filter(id => id !== event.teamId)];
  }

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
    this.results = await this.adminService.getGameCenterTeams(this.gameId, this.filterSettings);
    this.isLoading = false;
    this.updateFilterConfig();
  }

  private updateFilterConfig() {
    this.localStorageClient.add(StorageKey.GameCenterTeamsFilterSettings, this.filterSettings);
  }
}
