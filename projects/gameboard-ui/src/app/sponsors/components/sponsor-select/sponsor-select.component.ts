// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { Sponsor, SponsorWithChildSponsors } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { ConfigService } from '@/utility/config.service';
import { UserService } from '@/api/user.service';
import { ToastService } from '@/utility/services/toast.service';

interface SponsorSelectContext {
  parentSponsors: SponsorWithChildSponsors[];
  nonParentSponsors: Sponsor[];
}

@Component({
    selector: 'app-sponsor-select',
    templateUrl: './sponsor-select.component.html',
    standalone: false
})
export class SponsorSelectComponent {
  protected appName: string;
  protected errors: any[] = [];
  protected isAuthenticated$ = this
    .localUserService
    .user$
    .pipe(map(u => !!u?.id));
  protected isLoading = false;
  protected localUserSponsorId$ = this.localUserService
    .user$
    .pipe(map(u => u?.sponsor.id));

  protected ctx$: Observable<SponsorSelectContext>;

  constructor(
    config: ConfigService,
    private localUserService: LocalUserService,
    private sponsorService: SponsorService,
    private toastsService: ToastService,
    private usersService: UserService) {
    this.appName = config.appName;

    this.ctx$ = sponsorService
      .listWithChildren()
      .pipe(map(sponsors => {
        const parentSponsors = sponsors.filter(s => !!s.childSponsors?.length);
        const nonParentSponsors = sponsors.filter(s => !s.childSponsors?.length);

        return {
          parentSponsors: parentSponsors,
          nonParentSponsors: nonParentSponsors
        };
      }));
  }

  protected async handleSponsorSelect(sponsor: Sponsor) {
    if (!this.localUserService.user$.value) {
      return;
    }

    this.errors = [];
    this.isLoading = true;

    try {
      await firstValueFrom(this.usersService.update({
        id: this.localUserService.user$.value.id,
        sponsorId: sponsor.id
      }));

      this.toastsService.show({
        avatarUrl: this.sponsorService.resolveAbsoluteSponsorLogoUri(sponsor.logo),
        text: `Your sponsor has been changed to **${sponsor.name}**.`
      });
      this.localUserService.refresh();
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isLoading = false;
  }
}
