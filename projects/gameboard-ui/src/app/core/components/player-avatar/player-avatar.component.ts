import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Player } from '../../../api/player-models';

export enum PlayerAvatarSize {
  Small = "small",
  Medium = "medium",
  Large = "large"
}

@Component({
  selector: 'app-player-avatar',
  template: `
    <div [class]="'d-flex position-relative align-items-center justify-content-center player-avatar-component avatar-list-size ' + sizeClass +  ' ' + avatarCountClass">
      <div [class]="'avatar-container avatar-size ' + this.sizeClass" aria-roledescription="Player avatar icon"
          [style.background-image]="'url(' + avatarUri + ')'"></div>
      <app-player-status class="position-absolute status-light" *ngIf="enableSessionStatus" [playerId]="playerId"></app-player-status>
  </div>
  `,
  styleUrls: ['./player-avatar.component.scss']
})
export class PlayerAvatarComponent implements OnInit {
  @Input() avatarUri?: string;
  @Input() playerId: string | undefined;
  @Input() size = PlayerAvatarSize.Medium;
  @Input() enableSessionStatus = true;

  // this accommodates cases where we want to make sure that even though this avatar may be a single item, it
  // may be in a list-like view with a PlayerAvatarListComponent, and we need to arrange the width such that 
  // it's equal to the width of the list component
  @Input() maxAvatarsInListView?: number;

  protected avatarCountClass = '';
  protected sizeClass = '';
  protected sponsorLogoUri = '';
  protected hasActiveSession$: Observable<boolean | undefined> = of(undefined);

  ngOnInit(): void {
    this.sizeClass = `avatar-size-${this.size}`;

    if (this.maxAvatarsInListView) {
      this.avatarCountClass = `avatar-count-${this.maxAvatarsInListView}`;
    }
  }
}
