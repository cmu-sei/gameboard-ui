import { AvatarSize } from '@/core/models/avatar';
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-avatar',
  styleUrls: ['./avatar.component.scss'],
  template: `
    <div [class]="'avatar-container avatar-size ' + this.sizeClass" [style.background-image]="'url(' + imageUrl + ')'" [tooltip]="tooltip ? tooltip : ''"></div>
  `,
})
export class AvatarComponent implements OnChanges {
  @Input() imageUrl?: SafeUrl;
  @Input() size: AvatarSize = "medium";
  @Input() tooltip = "";

  @ViewChild("searchBox") searchBox?: ElementRef<Input>;

  protected sizeClass = "avatar-size-medium";

  ngOnChanges(changes: SimpleChanges): void {
    this.sizeClass = `avatar-size-${this.size}`;
  }
}