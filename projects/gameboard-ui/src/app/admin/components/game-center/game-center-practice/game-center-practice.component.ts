import { Component } from '@angular/core';
import { AdminService } from '@/api/admin.service';
import { fa } from "@/services/font-awesome.service";
import { TeamListCardContext } from '../../team-list-card/team-list-card.component';
import { GameCenterPracticeContext, GameCenterPracticeContextUser, GameCenterPracticeSessionStatus, GameCenterPracticeSort } from '../game-center.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { GameCenterPracticePlayerDetailComponent } from '../game-center-practice-player-detail/game-center-practice-player-detail.component';
import { debounceTime, Subject } from 'rxjs';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ActivatedRoute } from '@angular/router';

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
export class GameCenterPracticeComponent {
  protected ctx?: GameCenterPracticeContext;
  protected fa = fa;
  protected filterSettings: GameCenterPracticeFilterSettings = { sort: "name" };
  protected isLoading = false;
  protected teamCardContexts: { [userId: string]: TeamListCardContext } = {};
  protected searchInput$ = new Subject<string>();
  protected selectedUserIds: string[] = [];

  constructor(
    route$: ActivatedRoute,
    unsub: UnsubscriberService,
    private adminService: AdminService,
    private modalService: ModalConfirmService) {
    unsub.add(route$.data.subscribe(async d => await this.load(d.gameId)));
    unsub.add(this.searchInput$.pipe(debounceTime(500)).subscribe(async searchTerm => {
      this.filterSettings.searchTerm = searchTerm;
      await this.load(this.ctx?.game?.id);
    }));
  }

  protected async handleClearAllFilters() {
    this.filterSettings = { sort: "name" };
    await this.load(this.ctx?.game?.id);
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

  protected async load(gameId?: string): Promise<void> {
    if (!gameId)
      return;

    this.ctx = await this.adminService.getGameCenterPracticeContext(gameId, this.filterSettings);
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
