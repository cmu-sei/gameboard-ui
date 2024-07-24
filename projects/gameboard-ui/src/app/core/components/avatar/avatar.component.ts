import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

export type AvatarSize = 'tiny' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-avatar',
  styleUrls: ['./avatar.component.scss'],
  template: `
    <ng-template #tolTemplate>
      <ng-content [select]="avatarTooltip"></ng-content>
    </ng-template>
    <div [class]="'avatar-container avatar-size ' + this.sizeClass" [style.background-image]="escapedImgUrl" [tooltip]="tolTemplate"></div>
  `,
})
export class AvatarComponent implements OnChanges {
  @Input() imageUrl?: SafeUrl;
  @Input() size: AvatarSize = "medium";

  @ViewChild("searchBox") searchBox?: ElementRef<Input>;

  protected escapedImgUrl = "";
  protected sizeClass = "avatar-size-medium";

  ngOnChanges(changes: SimpleChanges): void {
    this.escapedImgUrl = this.imageUrl ? `url('${this.imageUrl}')` : "";
    this.sizeClass = `avatar-size-${this.size}`;
  }
}
