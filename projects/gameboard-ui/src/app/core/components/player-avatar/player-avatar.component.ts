import { PlayerWithSponsor } from '@/api/models';
import { TimeWindow } from '@/api/player-models';
import { SponsorService } from '@/api/sponsor.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-player-avatar',
  template: `
    <div [class]="'d-flex position-relative align-items-center justify-content-center player-avatar-component avatar-list-size ' + sizeClass +  ' ' + avatarCountClass">
      <app-avatar [size]="this.size" [imageUrl]="avatarUrl" [tooltip]="showSponsorTooltip ? tooltip : ''">
      </app-avatar>
      <app-player-status class="position-absolute status-light" *ngIf="session" [session]="session"></app-player-status>
    </div>
  `,
  styleUrls: ['./player-avatar.component.scss']
})
export class PlayerAvatarComponent implements OnChanges {
  @Input() player?: PlayerWithSponsor;
  @Input() session?: TimeWindow;
  @Input() showSponsorTooltip = true;
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' = 'medium';

  protected avatarCountClass = '';
  protected avatarUrl?: SafeUrl = "";
  protected sizeClass = "";
  protected tooltip = "";

  constructor(private sponsorService: SponsorService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.player) {
      throw new Error("Can't use PlayerAvatarComponent with a falsey player input.");
    }

    this.avatarUrl = `url(${this.sponsorService.resolveAbsoluteSponsorLogoUri(this.player.sponsor.logo)})`;
    this.sizeClass = `avatar-size-${this.size}`;
    this.tooltip = this.player.sponsor.name;
  }
}
