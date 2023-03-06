import { Component, Input, OnInit } from '@angular/core';
import { TimeWindow } from '../../../api/player-models';
import { PlayerAvatarSize } from '../player-avatar/player-avatar.component';

@Component({
  selector: 'app-player-avatar-list',
  template: `
  <div [class]="'player-avatar-list-component position-relative d-flex align-items-center avatar-list-size ' + this.sizeClass + ' ' + this.countClass">
    <ul *ngIf="(avatarUris?.length || 0) > 0" class="m-0 p-0 d-flex align-items-center justify-content-start">
      <li *ngFor="let avatarUri of avatarUris; index as i" [class]="'m-0 avatar-position-' + i + ' ' + this.sizeClass">
          <app-player-avatar [avatarUri]="avatarUri" [size]="avatarSize" [enableSessionStatus]="false"></app-player-avatar>
      </li>
    </ul>
    <app-player-status *ngIf="enableCaptainSessionStatusDisplay" [session]="captainSession"></app-player-status>
  </div>
  `,
  styleUrls: ['./player-avatar-list.component.scss']
})
export class PlayerAvatarListComponent implements OnInit {
  @Input() avatarUris: string[] = [];
  @Input() avatarSize = PlayerAvatarSize.Medium;
  @Input() enableCaptainSessionStatusDisplay: boolean = true;
  @Input() captainSession?: TimeWindow;

  protected sizeClass = "";
  protected countClass = "";

  ngOnInit(): void {
    this.avatarUris = this.avatarUris || [];
    this.countClass = `avatar-count-${this.avatarUris.length}`;
    this.sizeClass = `avatar-size-${this.avatarSize.toString()}`;
  }
}
