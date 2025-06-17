import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { slug } from '@/../tools/functions';
import { CertificatesService } from '@/api/certificates.service';
import { UserService as LocalUser } from '@/utility/user.service';
import { ConfigService } from '@/utility/config.service';
import { practiceCertificateToPublishedViewModel } from '@/users/functions';
import { PracticeModeCertificate } from '@/certificates/certificates.models';

interface PracticeCertificatesContext {
  certificates: PracticeModeCertificate[];
}

@Component({
    selector: 'app-practice-certificates',
    templateUrl: './practice-certificates.component.html',
    styleUrls: ['./practice-certificates.component.scss'],
    standalone: false
})
export class PracticeCertificatesComponent implements OnInit {
  ctx: PracticeCertificatesContext | null = null;
  protected slug = slug;
  protected apiHost: string | null = null;
  protected appBaseUrl: string | null = null;
  protected localUserId: string | null = null;
  protected toPublishedViewModel = practiceCertificateToPublishedViewModel;

  constructor(
    private certificatesService: CertificatesService,
    private config: ConfigService,
    private localUser: LocalUser) { }

  async ngOnInit(): Promise<void> {
    this.apiHost = this.config.apphost;
    this.appBaseUrl = this.config.absoluteUrl;
    this.localUserId = this.localUser.user$.value?.id || null;

    await this.loadCertificates();
  }

  protected async loadCertificates() {
    if (this.localUserId) {
      this.ctx = {
        certificates: await firstValueFrom(this.certificatesService.getPracticeCertificates(this.localUserId))
      };
    }
  }
}
