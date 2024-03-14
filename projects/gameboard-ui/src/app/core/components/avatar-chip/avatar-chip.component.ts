import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { fa } from "@/services/font-awesome.service";
import { AvatarSize } from '../avatar/avatar.component';

@Component({
  selector: 'app-avatar-chip',
  styleUrls: ['./avatar-chip.component.scss'],
  template: `
    <div class="avatar-chip-component d-flex align-content-center align-items-center" [class.avatar-size-small]="avatarSize == 'small'">
      <app-avatar *ngIf="avatarImageUrl" [imageUrl]="avatarImageUrl" [size]="avatarSize"></app-avatar>
      <div class="avatar-chip-content-container ml-2 pr-2">
        <ng-content></ng-content>
      </div>
      <div *ngIf="!hideActionButton" class="action-button-container">
        <button type="button" class="btn mr-1 px-2" (click)="handleActionButtonClick()" [tooltip]="actionTooltip">
          <fa-icon [icon]="fa.xMark"></fa-icon>
        </button>
      </div>
    </div>
  `
})
export class AvatarChipComponent {
  @Input() avatarImageUrl?: SafeUrl;
  @Input() avatarSize: AvatarSize = "small";
  @Input() avatarTooltip = "";
  @Input() actionTooltip = "";
  @Input() hideActionButton = false;
  @Output() actionClick = new EventEmitter();

  protected fa = fa;

  protected handleActionButtonClick() {
    this.actionClick.emit();
  }
}
