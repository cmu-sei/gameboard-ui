import { Component, Input, OnInit } from '@angular/core';
import { WindowService } from '../../../../services/window.service';

export enum PlayerAvatarSize {
  Small = "small",
  Medium = "medium",
  Large = "large"
}

@Component({
  selector: 'app-player-avatar',
  templateUrl: './player-avatar.component.html',
  styleUrls: ['./player-avatar.component.scss']
})
export class PlayerAvatarComponent implements OnInit {
  @Input() sponsorLogoUri!: string;
  @Input() size = PlayerAvatarSize.Medium;
  uriBase!: string;

  protected isSmall = false;
  protected isMedium = true;
  protected isLarge = false;

  constructor(private windowService: WindowService) { }

  ngOnInit(): void {
    this.uriBase = this.windowService.get()!.location.origin;

    this.isSmall = this.size == PlayerAvatarSize.Small;
    this.isMedium = this.size == PlayerAvatarSize.Medium;
    this.isLarge = this.size == PlayerAvatarSize.Large;
  }
}
