import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AdminService } from '@/api/admin.service';
import { TeamListCardContext } from '../../team-list-card/team-list-card.component';
import { GameCenterPracticeContext, GameCenterPracticeContextUser } from '../game-center.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-game-center-practice',
  templateUrl: './game-center-practice.component.html',
  styleUrls: ['./game-center-practice.component.scss']
})
export class GameCenterPracticeComponent implements OnChanges {
  @Input() gameId?: string;

  protected ctx?: GameCenterPracticeContext;
  protected teamCardContexts: { [userId: string]: TeamListCardContext } = {};
  protected isLoading = false;

  constructor(
    private adminService: AdminService,
    private modalService: ModalConfirmService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    await this.load();
  }

  protected handleUserDetailClick(user: GameCenterPracticeContextUser) {
    this.modalService.open({
      bodyContent: `User, challenges ${user.challenges.length}`,
      title: user.name
    });
  }

  private async load(): Promise<void> {
    if (!this.gameId)
      throw new Error("GameId is required.");

    this.ctx = await this.adminService.getGameCenterPracticeContext(this.gameId);
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
