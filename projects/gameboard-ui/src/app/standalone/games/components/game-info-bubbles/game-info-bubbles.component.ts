import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { DateTime } from 'luxon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameEngineMode } from '@/api/game-models';
import { fa } from "@/services/font-awesome.service";
import { PlayerMode } from '@/api/player-models';
import { IsLivePipe } from '@/games/pipes/is-live.pipe';

export interface GameInfoBubbleProperties {
  name: string;
  season: string;
  competition: string;
  track: string;
  gameStart?: DateTime;
  gameEnd?: DateTime;

  isPublished: boolean;
  maxTeamSize: number;
  engineMode: GameEngineMode;
  playerMode: PlayerMode;
  startDate?: DateTime;
  countTeams?: number;
}

@Component({
  selector: 'app-game-info-bubbles',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    IsLivePipe,
    TooltipModule
  ],
  styles: [
    "fa-icon { vertical-align: middle; }",
    "li { margin-right: 1rem; padding: 0; text-align: center; vertical-align: middle; }",
    "img { object-fit: contain }",
    ".team-icon path { stroke: #00ffff; fill: #00ffff } "
  ],
  template: `
    <ul class="game-info-bubbles d-flex align-items-center py-0 px-2" *ngIf="game">
      <li *ngIf="(game | isLive) && game.playerMode !== 'practice'" class="rounded-circle">
        <fa-icon [size]="bubbleSize" [icon]="fa.towerBroadcast" tooltip="Live now!" animation="beat-fade" style="--fa-animation-duration: 3s; --fa-beat-scale; 1.1; --fa-animation-timing: ease-in-out;"></fa-icon>
      </li>

      <li class="rounded-circle">
        <fa-icon [size]="bubbleSize" [icon]="fa.infoCircle" [tooltip]="tooltipTemplate"></fa-icon>
      </li>

      <li class="rounded-circle">
          <fa-icon [size]="bubbleSize" [icon]="teamSizeIcon" [tooltip]="teamSizeTooltip" [class.team-icon]="(game.maxTeamSize || 0) > 1"></fa-icon>
      </li>

      <li class="rounded-circle" *ngIf="game.playerMode == 'practice'">
        <fa-icon [size]="bubbleSize" [icon]="fa.circlePlay" tooltip="Practice Mode"></fa-icon>
      </li>

      <li class="rounded-circle">
        <fa-icon [size]="bubbleSize" [icon]="engineModeIcon" [tooltip]="engineModeTooltip"></fa-icon>
      </li>

      <li *ngIf="!game.isPublished" class="rounded-circle">
        <fa-icon [size]="bubbleSize" [icon]="fa.eyeSlash" tooltip="Unpublished"></fa-icon>
      </li>
  </ul>

  <ng-template #tooltipTemplate>
      <div>{{ infoTooltip.name }}</div>
      <div class="fs-09 text-muted font-style-italic">{{ infoTooltip.detail }}</div>
      <div class="fs-085 text-muted font-weight-bold" *ngIf="infoTooltip.countTeams">{{ infoTooltip.countTeams }} {{ (game?.maxTeamSize || 0) > 1 ? "teams" : "players"}}</div>
  </ng-template>
  `
})
export class GameInfoBubblesComponent implements OnChanges {
  @Input() game?: GameInfoBubbleProperties;
  @Input() bubbleSize: SizeProp = "2xl";

  protected engineModeIcon = fa.computer;
  protected engineModeTooltip = "";
  protected fa = fa;
  protected infoTooltip: { name: string; detail?: string; countTeams?: number } = { name: "" };
  protected teamSizeTooltip = "";
  protected teamSizeIcon = fa.person;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.game?.currentValue)
      return;

    const game = changes.game.currentValue;

    this.engineModeIcon = game.mode == GameEngineMode.Standard ? fa.computer : fa.gamepad;
    this.engineModeTooltip = game.mode == GameEngineMode.Standard ? "Standard VMs" : "External Host";

    this.infoTooltip = {
      name: game.name,
      detail: `${this.buildTooltipDetail(game)}`,
      countTeams: game.countTeams,
    };

    this.teamSizeIcon = game.maxTeamSize > 1 ? fa.peopleGroup : fa.circleUser;
    this.teamSizeTooltip = game.maxTeamSize > 1 ? `Teams of up to ${game.maxTeamSize}` : "Individual";
  }

  private buildTooltipDetail(game: GameInfoBubbleProperties): string {
    let detail = "";

    if (game.competition)
      detail += `${game.competition} / `;

    if (game.season)
      detail += `${game.season} / `;

    if (game.track)
      detail += `${game.track} / `;

    return detail ? detail.substring(0, detail.length - 3) : detail;
  }
}
