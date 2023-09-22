import { Component } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { GetSponsorsByParentResponse, Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { ConfigService } from '@/utility/config.service';

@Component({
  selector: 'app-sponsor-select',
  templateUrl: './sponsor-select.component.html',
  styleUrls: ['./sponsor-select.component.scss'],
})
export class SponsorSelectComponent {
  protected appName: string;
  protected sponsors$: Observable<GetSponsorsByParentResponse>;
  protected isAuthenticated$: Observable<boolean> = this
    .localUserService
    .user$
    .pipe(map(u => !!u?.id));

  constructor(
    config: ConfigService,
    sponsorService: SponsorService,
    private localUserService: LocalUserService) {
    this.appName = config.appName;
    this.sponsors$ = sponsorService.listByParent();
  }
}
