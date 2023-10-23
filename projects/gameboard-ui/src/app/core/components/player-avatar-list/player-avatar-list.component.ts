import { Component, Input, OnInit } from '@angular/core';
import { TimeWindow } from '../../../api/player-models';
import { PlayerWithSponsor } from '@/api/models';

@Component({
  selector: 'app-player-avatar-list',
  template: `
  <div [class]="'player-avatar-list-component position-relative d-flex align-items-center avatar-list-size ' + this.sizeClass + ' ' + this.countClass">
    <ul *ngIf="(players.length || 0) > 0; else justUris" class="m-0 p-0 d-flex align-items-center justify-content-start">
      <li *ngFor="let player of players; index as i" [class]="'m-0 avatar-position-' + i + ' ' + this.sizeClass">
        <app-player-avatar [player]="player" [size]="avatarSize"></app-player-avatar>
      </li>
    </ul>
    <app-player-status *ngIf="captainSession" [session]="captainSession"></app-player-status>
  </div>

  <!--legacy compatibility for places where we haven't updated the team/player avatar spots with a full PlayerWithSponsor object-->
  <ng-template #justUris>
    <ul *ngIf="(avatarUris?.length || 0) > 0" class="m-0 p-0 d-flex align-items-center justify-content-start">
      <li *ngFor="let avatarUri of avatarUris; index as i" [class]="'m-0 avatar-position-' + i + ' ' + this.sizeClass">
          <app-player-avatar-legacy [avatarUri]="avatarUri" [size]="avatarSize" [enableSessionStatus]="false"></app-player-avatar-legacy>
      </li>
    </ul>
  </ng-template>
  `,
  styleUrls: ['./player-avatar-list.component.scss']
})
export class PlayerAvatarListComponent implements OnInit {
  // both the pure uri and the sponsors are here because some places we don't have
  // the sponsor metadata yet, and in others we do
  @Input() avatarUris: string[] = [];
  @Input() players: PlayerWithSponsor[] = [];
  @Input() avatarSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() showSessionStatusWidget: boolean = true;
  @Input() captainSession?: TimeWindow;

  protected sizeClass = "";
  protected countClass = "";

  ngOnInit(): void {
    this.avatarUris = this.avatarUris || [];
    this.countClass = `avatar-count-${this.avatarUris.length}`;
    this.sizeClass = `avatar-size-${this.avatarSize.toString()}`;
  }
}
