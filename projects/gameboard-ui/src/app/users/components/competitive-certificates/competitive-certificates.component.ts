import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faAward, faPrint, faMedal, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { competitiveCertificateToPublishedViewmodel } from '@/users/functions';
import { CompetitiveModeCertificate } from '@/certificates/certificates.models';
import { CertificatesService } from '@/api/certificates.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ConfigService } from '@/utility/config.service';
import { ApiUser } from '@/api/user-models';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-certificate-list',
    templateUrl: './competitive-certificates.component.html',
    styleUrls: ['./competitive-certificates.component.scss'],
    standalone: false
})
export class CompetitiveCertificatesComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faAward = faAward;
  faMedal = faMedal;
  faPrint = faPrint;
  faUser = faUser;
  faUsers = faUsers;

  protected apiHost = "";
  protected isLoading = false;
  protected localUser$: Observable<ApiUser | null>;
  protected toPublishedViewModel = competitiveCertificateToPublishedViewmodel;
  protected certificates: CompetitiveModeCertificate[] = [];

  constructor(
    private certificatesService: CertificatesService,
    private configService: ConfigService,
    private localUser: LocalUserService
  ) {
    this.localUser$ = localUser.user$;
  }

  async ngOnInit(): Promise<void> {
    this.apiHost = this.configService.apphost;
    this.localUser$ = this.localUser.user$;
    await this.load();
  }

  protected async load(): Promise<void> {
    if (!this.localUser.user$.value?.id) {
      return;
    }

    this.isLoading = true;
    this.certificates = await this.certificatesService.getCompetitiveCertificates(this.localUser.user$.value.id);
    this.isLoading = false;
  }
}
