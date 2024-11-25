import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, firstValueFrom, map, Subject } from 'rxjs';
import { AdminService } from '@/api/admin.service';
import { fa } from '@/services/font-awesome.service';
import { Game } from '@/api/game-models';
import { GameService } from '@/api/game.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ToastService } from '@/utility/services/toast.service';
import { AdminEnrollTeamModalComponent } from '../../admin-enroll-team-modal/admin-enroll-team-modal.component';
import { ManageManualChallengeBonusesModalComponent } from '../../manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { SimpleEntity } from '@/api/models';
import { GameCenterTeamsAdvancementFilter, GameCenterTeamSessionStatus, GameCenterTeamsResults, GameCenterTeamsResultsTeam, GameCenterTeamsSort } from '../game-center.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { unique } from '@/../tools/tools';
import { ScoreboardTeamDetailModalComponent } from '@/scoreboard/components/scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ExtendTeamsModalComponent } from '../../extend-teams-modal/extend-teams-modal.component';
import { LocalStorageService, StorageKey } from '@/services/local-storage.service';
import { NowService } from '@/services/now.service';
import { GameCenterTeamDetailComponent } from '../game-center-team-detail/game-center-team-detail.component';
import { TeamService } from '@/api/team.service';
import { eventTargetValueToString } from 'projects/gameboard-ui/src/tools/functions';

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

  protected errors: string[] = [];
  protected fa = fa;
  protected game?: Game;
  protected hasFilters = false;
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
    private route: ActivatedRoute,
    private teamService: TeamService,
    private toastService: ToastService,
    private unsub: UnsubscriberService) {

    this.unsub.add(
      this.route.data.subscribe(async d => await this.load(d.gameId)),
      this.searchInput$.pipe(debounceTime(300)).subscribe(async event => {
        const currentValue = eventTargetValueToString(event);

        this.filterSettings.searchTerm = currentValue || "";
        await this.load(this.game?.id);
      }),
      this.route.queryParams.subscribe(async qp => {
        if (qp.search) {
          this.searchInput$.next(qp.search);
        }
      }),
      this.teamService.teamSessionExtended$.subscribe(async updates => {
        for (const update of updates) {
          if (this.results?.teams?.items?.find(t => t.id === update.id)) {
            await this.load(this.game?.id);
            return;
          }
        }
      }),
      this.teamService.teamRosterChanged$.subscribe(async teamId => {
        if (this?.results?.teams?.items?.find(t => t.id === teamId)) {
          await this.load(this.game?.id);
        }
      })
    );
  }

  async ngOnInit(): Promise<void> {
    this.filterSettings = this.localStorageClient.getAs<GameCenterTeamsFilterSettings>(StorageKey.GameCenterTeamsFilterSettings, this.filterSettings);
  }

  protected async handleClearAllFilters() {
    this.filterSettings = { sort: "rank" };
    await this.load(this.game?.id);
  }

  protected async handleConfirmDeployGameResources() {
    const teams = this.resolveSelectedTeams();
    const nowish = this.nowService.nowToMsEpoch();

    if (!teams.length) {
      this.modalService.openConfirm({
        title: "No eligible teams",
        bodyContent: "There are no teams eligible for deployment."
      });

      return;
    }

    const eligibleTeams: GameCenterTeamsResultsTeam[] = [];
    const ineligibleTeams: GameCenterTeamsResultsTeam[] = [];

    for (const team of teams) {
      if (team.session.end && team.session.end < nowish) {
        ineligibleTeams.push(team);
      }
      else {
        eligibleTeams.push(team);
      }
    }

    if (ineligibleTeams.length) {
      this.modalService.openConfirm({
        title: "Ineligible teams",
        subtitle: this.game?.name,
        bodyContent: "Some teams are ineligible to have resources deployed because they've already finished their sessions. Unselect them to proceed.\n\n" + ineligibleTeams
          .map(t => ` - ${t.name || "_(no name)_"}`)
          .join('\n\n'),
        renderBodyAsMarkdown: true
      });

      return;
    }


    await this.handleDeployGameResources(eligibleTeams);
  }

  protected handleContextMenuError(errs: string[]) {
    this.errors.push(...errs);
  }

  private async handleDeployGameResources(eligibleTeams: GameCenterTeamsResultsTeam[]) {
    this.toastService.showMessage(`Deploying resources for ${eligibleTeams.length}...`);
    await this.gameService.deployResources(this.gameId!, eligibleTeams.map(t => t.id));
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

    this.teamService.getMailMetadata(this.gameId)
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
    await this.load(this.game?.id);
  }

  protected async handleRerankClick(gameId: string) {
    this.toastService.showMessage("Pulling out the calculator...");
    this.isLoading = true;
    await firstValueFrom(this.gameService.rerank(gameId));
    this.isLoading = false;

    await this.load(this.game?.id);
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
          await this.load(this.game?.id);
        }
      },
      modalClasses: ["modal-xl"]
    });
  }

  protected async load(gameId?: string) {
    if (gameId && this.game?.id !== gameId) {
      this.game = await firstValueFrom(this.gameService.retrieve(gameId));
    }

    if (!gameId && !this.game?.id)
      return;

    gameId = this.game?.id;
    this.gameId = gameId;

    this.isLoading = true;
    this.results = await this.adminService.getGameCenterTeams(gameId!, this.filterSettings);
    this.isLoading = false;
    this.updateFilterConfig();
  }

  private resolveSelectedTeams() {
    if (!this.results)
      return [];

    const hasSelection = this.selectedTeamIds.length;
    return this.results.teams.items.filter(t => !hasSelection || this.selectedTeamIds.indexOf(t.id) >= 0);
  }

  private updateFilterConfig() {
    this.localStorageClient.add(StorageKey.GameCenterTeamsFilterSettings, this.filterSettings);
    this.hasFilters = this.filterSettings && (
      !!this.filterSettings.advancement ||
      !!this.filterSettings.hasPendingNames ||
      !!this.filterSettings.searchTerm ||
      !!this.filterSettings.sessionStatus ||
      this.filterSettings?.sort !== 'rank'
    );
  }
}
