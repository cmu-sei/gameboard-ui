import { Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { ApiUser } from '@/api/user-models';
import { UserService } from '@/api/user.service';
import { ToastService } from '@/utility/services/toast.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sponsor-with-children-picker',
  templateUrl: './sponsor-with-children-picker.component.html',
  styleUrls: ['./sponsor-with-children-picker.component.scss']
})
export class SponsorWithChildrenPickerComponent implements OnInit {
  @Input() forceSelection = false;
  @Input() parentSponsor?: Sponsor;
  @Input() childSponsors?: Sponsor[];
  @Input() hideHeader = false;

  protected localUser$: Observable<ApiUser | null>;

  constructor(
    private api: UserService,
    private localUserService: LocalUserService,
    private sponsorService: SponsorService,
    private toastService: ToastService) {
    this.localUser$ = localUserService.user$.asObservable();
  }

  ngOnInit(): void {
    if (!this.childSponsors) {
      throw new Error("SponsorWithChildrenPickerComponent requires the childSponsors input.");
    }
  }

  async updateUserSponsor(user: ApiUser, sponsor: Sponsor) {
    await firstValueFrom(this.api.update({
      id: user.id,
      sponsorId: sponsor.id
    }));

    this.toastService.show({
      avatarUrl: this.sponsorService.resolveAbsoluteSponsorLogoUri(sponsor.logo),
      text: `Your sponsor has been changed to **${sponsor.name}**.`
    });
    this.localUserService.refresh();
  }
}
