import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Sponsor, SponsorWithChildSponsors } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { ConfigService } from '@/utility/config.service';

interface SponsorSelectContext {
  parentSponsors: SponsorWithChildSponsors[];
  nonParentSponsors: Sponsor[];
}

@Component({
  selector: 'app-sponsor-select',
  templateUrl: './sponsor-select.component.html',
  styleUrls: ['./sponsor-select.component.scss'],
})
export class SponsorSelectComponent {
  protected appName: string;
  protected isAuthenticated$: Observable<boolean> = this
    .localUserService
    .user$
    .pipe(map(u => !!u?.id));
  protected ctx$: Observable<SponsorSelectContext>;

  constructor(
    config: ConfigService,
    sponsorService: SponsorService,
    private localUserService: LocalUserService) {
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
}
