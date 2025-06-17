import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fa } from "@/services/font-awesome.service";
import { GameCenterPracticeContextUser } from '../game-center.models';
import { CoreModule } from '@/core/core.module';
import { SimpleEntity } from '@/api/models';
import { PracticeService } from '@/services/practice.service';
import { TeamService } from '@/api/team.service';
import { ToastService } from '@/utility/services/toast.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';

@Component({
    selector: 'app-game-center-practice-team-context-menu',
    imports: [
        CommonModule,
        CoreModule,
    ],
    templateUrl: './game-center-practice-team-context-menu.component.html',
    styleUrls: ['./game-center-practice-team-context-menu.component.scss']
})
export class GameCenterPracticeTeamContextMenuComponent implements OnInit {
  @Input() user?: GameCenterPracticeContextUser;
  @Input() game?: SimpleEntity;
  @Output() sessionReset = new EventEmitter<GameCenterPracticeContextUser>();
  @Output() teamDetailClick = new EventEmitter<GameCenterPracticeContextUser>();

  private practiceService = inject(PracticeService);
  private modalService = inject(ModalConfirmService);
  private routerService = inject(RouterService);
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);

  protected fa = fa;
  protected observeUrl?: string;

  ngOnInit(): void {
    if (this.game && this.user?.activeTeamId) {
      this.observeUrl = this.routerService.getObserveTeamsUrl(this.game.id, this.user.activeTeamId);
    }
  }

  protected handleResetSessionClick() {
    if (!this.user?.activeChallenge) {
      throw new Error("User doesn't have an active practice challenge.");
    }

    this.modalService.openConfirm({
      title: "Reset Practice Session?",
      subtitle: this.user.name,
      bodyContent: `Reset ${this.user.name}'s practice session? All of their progress in the current session will be erased. **You can't undo this**.`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        const session = await this.practiceService.getSession();
        if (session) {
          try {
            await this.teamService.endSession({ teamId: session.teamId });
          }
          catch (err: any) {
            this.toastService.showMessage(`Error resetting session: ${err}`);
          }
        }

        if (this.user) {
          this.toastService.showMessage(`User **${this.user.name}**'s practice session has been reset.`);
          this.sessionReset.emit(this.user);
        }
      }
    });
  }
}
