import { Component, Input, OnInit } from '@angular/core';
import { HubPlayer } from '../../../api/player-models';
import { PlayerAvatarSize } from '../player-avatar/player-avatar.component';

@Component({
  selector: 'app-player-avatar-list',
  template: `
  <div [class]="'player-avatar-list-component avatar-list-size ' + this.sizeClass + ' ' + this.countClass">
    <ul *ngIf="(avatarUris?.length || 0) > 0" class="m-0 p-0 d-flex align-items-center justify-content-start">
      <li *ngFor="let avatarUri of avatarUris; index as i" [class]="'m-0 avatar-position-' + i + ' ' + this.sizeClass">
          <app-player-avatar [avatarUri]="avatarUri" [size]="avatarSize"></app-player-avatar>
      </li>
    </ul>
  </div>
  `,
  styleUrls: ['./player-avatar-list.component.scss']
})
export class PlayerAvatarListComponent implements OnInit {
  @Input() avatarUris: string[] = [];
  @Input() avatarSize = PlayerAvatarSize.Medium;
  protected sizeClass = "";
  protected countClass = "";

  ngOnInit(): void {
    this.countClass = `avatar-count-${this.avatarUris.length}`;
    this.sizeClass = `avatar-size-${this.avatarSize.toString()}`;
  }
}
