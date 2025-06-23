import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, filter, map, tap } from 'rxjs';
import { LogService } from '@/services/log.service';
import { RouterService } from '@/services/router.service';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ApiUser } from '@/api/user-models';
import { Sponsor } from '@/api/sponsor-models';

@Component({
    selector: 'app-sponsor-select-banner',
    imports: [
        CommonModule,
        RouterModule
    ],
    template: `
    <div *ngIf="(user$ | async) && (!(sponsor$ | async) || (user$ | async)!.hasDefaultSponsor)"
      class="sponsor-select-banner-component position-sticky width-100 bg-warning py-2 text-center">
      <strong>Heads up!</strong>
      You haven't selected your sponsoring organization. You'll need to do so before you play challenges on {{appName}}.
      Head over to your <a [routerLink]="profileUrl" class="color-foreground">profile</a> to
      choose your sponsor!
    </div>
  `,
    styleUrls: ['./sponsor-select-banner.component.scss']
})
export class SponsorSelectBannerComponent {
  protected appName = "Gameboard";
  protected profileUrl = "";
  protected sponsor$: Observable<Sponsor | undefined>;
  protected user$: Observable<ApiUser | null>;

  constructor(
    config: ConfigService,
    localUserService: LocalUserService,
    logService: LogService,
    routerService: RouterService) {
    this.appName = config.environment.settings.appname || this.appName;
    this.profileUrl = routerService.getProfileUrl();

    if (!this.profileUrl) {
      logService.logError("Couldn't resolve the profile URL from the router service.");
    }

    this.user$ = localUserService.user$;
    this.sponsor$ = localUserService
      .user$
      .pipe(
        map(u => u?.sponsor),
        filter(s => !!s)
      );
  }
}
