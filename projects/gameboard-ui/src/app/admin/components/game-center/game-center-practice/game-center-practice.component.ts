import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AdminService } from '@/api/admin.service';
import { fa } from "@/services/font-awesome.service";
import { TeamListCardContext } from '../../team-list-card/team-list-card.component';
import { GameCenterPracticeContext, GameCenterPracticeContextUser, GameCenterPracticeSessionStatus, GameCenterPracticeSort } from '../game-center.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { GameCenterPracticePlayerDetailComponent } from '../game-center-practice-player-detail/game-center-practice-player-detail.component';
import { debounceTime, Subject } from 'rxjs';
import { UnsubscriberService } from '@/services/unsubscriber.service';

interface GameCenterPracticeFilterSettings {
  searchTerm?: string;
  sessionStatus?: GameCenterPracticeSessionStatus;
  sort?: GameCenterPracticeSort;
}

@Component({
  selector: 'app-game-center-practice',
  templateUrl: './game-center-practice.component.html',
  styleUrls: ['./game-center-practice.component.scss']
})
export class GameCenterPracticeComponent implements OnChanges {
  @Input() gameId?: string;

  protected ctx?: GameCenterPracticeContext;
  protected fa = fa;
  protected filterSettings: GameCenterPracticeFilterSettings = { sort: "name" };
  protected isLoading = false;
  protected teamCardContexts: { [userId: string]: TeamListCardContext } = {};
  protected searchInput$ = new Subject<string>();
  protected selectedUserIds: string[] = [];

  constructor(
    unsub: UnsubscriberService,
    private adminService: AdminService,
    private modalService: ModalConfirmService) {
    unsub.add(this.searchInput$.pipe(debounceTime(500)).subscribe(async searchTerm => {
      this.filterSettings.searchTerm = searchTerm;
      await this.load();
    }));
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.load();
  }

  protected async handleClearAllFilters() {
    this.filterSettings = { sort: "name" };
    await this.load();
  }

  protected async handleSearch(value: string) {
    this.filterSettings.searchTerm = value;

  }

  protected handleUserDetailClick(user: GameCenterPracticeContextUser) {
    if (!this.ctx)
      throw new Error("Context is required.");

    this.modalService.openComponent({
      content: GameCenterPracticePlayerDetailComponent,
      context: {
        ctx: {
          ...user,
          game: this.ctx.game
        }
      },
      modalClasses: ["modal-lg"]
    });
  }

  protected async load(): Promise<void> {
    if (!this.gameId)
      throw new Error("GameId is required.");

    this.ctx = await this.adminService.getGameCenterPracticeContext(this.gameId, this.filterSettings);
    this.teamCardContexts = {};
    for (let user of this.ctx.users) {
      this.teamCardContexts[user.id] = {
        id: user.id,
        name: user.name,
        captain: { id: user.id, name: user.name, sponsor: user.sponsor },
        players: []
      };
    }
  }
}
