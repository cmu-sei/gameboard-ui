import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';
import { Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { ApiUser } from '@/api/user-models';
import { UserService } from '@/api/user.service';
import { CoreModule } from '@/core/core.module';

@Component({
  selector: 'app-sponsor-select',
  templateUrl: './sponsor-select.component.html',
  styleUrls: ['./sponsor-select.component.scss'],
  imports: [CommonModule, CoreModule],
  standalone: true
})
export class SponsorSelectComponent {
  protected sponsors$: Observable<Sponsor[]>;
  protected localUser$: Observable<ApiUser | null>;

  constructor(
    sponsorService: SponsorService,
    private localUserService: LocalUserService,
    private api: UserService) {
    this.localUser$ = this.localUserService.user$.asObservable();
    this.sponsors$ = sponsorService.list();
  }

  async updateUserSponsor(user: ApiUser, sponsor: Sponsor) {
    await firstValueFrom(this.api.update({
      id: user.id,
      sponsorId: sponsor.id
    }));
  }
}
