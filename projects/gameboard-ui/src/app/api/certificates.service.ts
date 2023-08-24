import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, firstValueFrom, forkJoin, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { PracticeModeCertificate, PublishedCertificateViewModel } from '@/users/users.models';
import { ConfigService } from '@/utility/config.service';
import { PlayerMode } from './player-models';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  constructor(
    private apiUrl: ApiUrlService,
    private config: ConfigService,
    private domSanitizer: DomSanitizer,
    private http: HttpClient) { }

  getCertificateImage(mode: PlayerMode, userId: string, challengeSpecId: string) {
    return this.http.get(this.apiUrl.build(`user/${userId}/certificates/${this.coerceCompetitionModeString(mode)}/${challengeSpecId}`), { responseType: "arraybuffer" }).pipe(
      map(response => new Blob([response])),
      map(blob => window.URL.createObjectURL(blob)),
      map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
    );
  }

  getPracticeCertificates(userId: string): Observable<PracticeModeCertificate[]> {
    return this.http.get<PracticeModeCertificate[]>(this.apiUrl.build(`user/${userId}/certificates/practice`));
  }

  publishCertificate(mode: PlayerMode, ownerUserId: string, awardedForEntityId: string): Promise<PublishedCertificateViewModel> {
    return firstValueFrom(
      this
        .http
        .post<PublishedCertificateViewModel>(this.apiUrl.build(`user/${ownerUserId}/certificates/${this.coerceCompetitionModeString(mode)}/${awardedForEntityId}`), {})
    );
  }

  unpublishCertificate(mode: PlayerMode, ownerUserId: string, awardedForEntityId: string): Promise<PublishedCertificateViewModel> {
    return firstValueFrom(
      this
        .http
        .delete<PublishedCertificateViewModel>(this.apiUrl.build(`user/${ownerUserId}/certificates/${this.coerceCompetitionModeString(mode)}/${awardedForEntityId}`)));
  }

  private coerceCompetitionModeString(mode: PlayerMode) {
    return mode == PlayerMode.competition ? "competitive" : "practice";
  }
}
