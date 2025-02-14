import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { PlacementForBs5 } from 'ngx-bootstrap/positioning';

export type AvatarSize = 'tiny' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-avatar',
  styleUrls: ['./avatar.component.scss'],
  template: `
    <ng-template #tolTemplate>
      <div #tooltipProjection>
        <ng-content [select]="avatarTooltip"></ng-content>
      </div>
    </ng-template>
    <div [class]="'avatar-container avatar-size ' + this.sizeClass" [style.background-image]="escapedImgUrl" [tooltip]="tooltipProjection?.nativeElement?.children?.length ? tolTemplate : undefined" [placement]="tooltipPlacement"></div>
  `,
})
export class AvatarComponent implements OnChanges {
  @Input() imageUrl?: SafeUrl;
  @Input() size: AvatarSize = "medium";
  @Input() tooltipPlacement = PlacementForBs5.top;

  @ViewChild("searchBox") searchBox?: ElementRef<Input>;
  @ViewChild("tooltipProjection") tooltipProjection?: ElementRef<HTMLDivElement>;

  protected escapedImgUrl = "";
  protected sizeClass = "avatar-size-medium";

  ngOnChanges(changes: SimpleChanges): void {
    this.escapedImgUrl = this.imageUrl ? `url('${this.imageUrl}')` : "";
    this.sizeClass = `avatar-size-${this.size}`;
  }
}
