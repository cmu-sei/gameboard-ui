import { Component, Input, OnInit } from '@angular/core';
import { SimpleEntity } from '@/api/models';
import { EventHorizonModalComponent } from '@/event-horizon/components/event-horizon-modal/event-horizon-modal.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';

export interface TicketSupportToolsContext {
  challenge?: SimpleEntity;
  player?: SimpleEntity;
  game?: SimpleEntity;
  timeTilSessionEndMs?: number;
  team: {
    id: string,
    name: string,
    isMultiplePlayers: boolean
  };
}

@Component({
  selector: 'app-ticket-support-tools',
  styleUrls: ['./ticket-support-tools.component.scss'],
  template: `
  <ul *ngIf="hasGameContext; else noGameContext">
    <li *ngIf="isActiveSession && (observeChallengeUrl || observeTeamUrl)">
      Observe
        <ul>
          <li>
            <a target="_blank" rel="noopener noreferrer" [href]="observeChallengeUrl">
              The challenge
            </a>
          </li>
          <li>
            <a target="_blank" rel="noopener noreferrer" [href]="observeTeamUrl">
              The team
            </a>
          </li>
        </ul>
    </li>
    <li *ngIf="challengeStateUrl">
      <a target="_blank" rel="noopener noreferer" [href]="challengeStateUrl">
          View the challenge's state
      </a>
    </li>

    <li *ngIf="context?.team?.id">
      <button type="button" class="btn btn-link" (click)="handleViewTimelineClick()">
          View this team's timeline
      </button>
    </li>

    <li *ngIf="playerAdminUrl" >
      <a target="_blank" rel="noopener noreferer" [href]="playerAdminUrl">
          View this player's info in Admin
      </a>
    </li>

    <li *ngIf="gameboardUrl">
      <a target="_blank" rel="noopener noreferer" [href]="gameboardUrl">
          View the game's page
      </a>
    </li>
  </ul>
  <ng-template #noGameContext>
    <div class="gray-text">
      Attach this ticket to a game or challenge to use these tools.
    </div>
  </ng-template>
`
})
export class TicketSupportToolsComponent implements OnInit {
  @Input() context?: TicketSupportToolsContext;

  protected hasGameContext = false;
  protected challengeStateUrl?: string;
  protected gameboardUrl?: string;
  protected isActiveSession = false;
  protected observeChallengeUrl?: string;
  protected observeTeamUrl?: string;
  protected playerAdminUrl?: string;

  constructor(
    private modalService: ModalConfirmService,
    private routerService: RouterService) { }

  ngOnInit(): void {
    const hasGame = !!this.context?.game;

    if (this.context?.challenge?.id) {
      this.challengeStateUrl = this.context?.challenge ? this.routerService.getAdminChallengeUrl(this.context?.challenge.id) : undefined;

      if (this.context?.game?.id) {
        this.observeChallengeUrl = this.routerService.getObserveChallengeUrl(this.context.game.id, this.context.challenge.id);
        this.observeTeamUrl = this.routerService.getObserveTeamsUrl(this.context.game.id, this.context.team.id);
      }
    }

    if (this.context?.game) {
      this.gameboardUrl = hasGame ? this.routerService.getGamePageUrl(this.context.game!.id).toString() : undefined;

      if (this.context?.player) {
        this.playerAdminUrl = hasGame ? this.routerService.getAdminGamePlayerUrl(this.context.game!.id, this.context.player.id) : undefined;
      }
    }

    this.isActiveSession = !!this.context?.timeTilSessionEndMs && this.context.timeTilSessionEndMs > 0;
    this.hasGameContext = hasGame || !!this.challengeStateUrl || !!this.gameboardUrl || !!this.playerAdminUrl;
  }

  handleViewTimelineClick() {
    if (!this.context)
      return;

    this.modalService.openComponent<EventHorizonModalComponent>({
      content: EventHorizonModalComponent,
      context: this.context,
      modalClasses: ["modal-lg", "modal-dialog-centered"],
      ignoreBackdropClick: true
    });
  }
}
