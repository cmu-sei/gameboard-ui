// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TimeWindow } from '@/api/player-models';

@Component({
    selector: 'app-player-avatar-legacy',
    template: `
    <div *ngIf="avatarUri" [class]="'d-flex position-relative align-items-center justify-content-center player-avatar-component avatar-list-size ' + sizeClass +  ' ' + avatarCountClass">
      <div [class]="'avatar-container avatar-size ' + this.sizeClass" aria-roledescription="Player avatar icon"
          [style.background-image]="'url(' + avatarUri + ')'"></div>
      <app-player-status class="position-absolute status-light" *ngIf="enableSessionStatus" [session]="session"></app-player-status>
  </div>
  `,
    styleUrls: ['./player-avatar-legacy.component.scss'],
    standalone: false
})
export class PlayerAvatarLegacyComponent implements OnInit, OnChanges {
  @Input() avatarUri?: string | undefined | null;
  @Input() session?: TimeWindow;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() enableSessionStatus = false;

  // this accommodates cases where we want to make sure that even though this avatar may be a single item, it
  // may be in a list-like view with a PlayerAvatarListComponent, and we need to arrange the width such that
  // it's equal to the width of the list component
  // Ben, months later: ... or maybe just pass some styling semantics in here rather than talking about list views? 🤦
  @Input() maxAvatarsInListView?: number;

  protected avatarCountClass = '';
  protected sizeClass = '';
  protected hasActiveSession$: Observable<boolean | undefined> = of(undefined);

  ngOnInit(): void {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  private update() {
    this.sizeClass = `avatar-size-${this.size}`;

    if (this.maxAvatarsInListView) {
      this.avatarCountClass = `avatar-count-${this.maxAvatarsInListView}`;
    }
  }
}
