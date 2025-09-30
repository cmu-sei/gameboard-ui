// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, firstValueFrom, forkJoin, map } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { PlayerMode } from './player-models';
import { CertificateTemplateView, CompetitiveModeCertificate, PracticeModeCertificate, PublishedCertificateViewModel, UpsertCertificateTemplate } from '@/certificates/certificates.models';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  constructor(
    private apiUrl: ApiUrlService,
    private domSanitizer: DomSanitizer,
    private http: HttpClient) { }

  getCertificateImage(mode: PlayerMode, userId: string, awardedForEntityId: string, requestedName?: string) {
    const queryArgs = requestedName ? `?requestedNameOverride=${requestedName}` : "";

    return this.http.get(this.apiUrl.build(`user/${userId}/certificates/${this.coerceCompetitionModeString(mode)}/${awardedForEntityId}${queryArgs}`), {
      responseType: "arraybuffer"
    }).pipe(
      map(response => new Blob([response])),
      map(blob => window.URL.createObjectURL(blob)),
      map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
    );
  }

  getCertificatePreviewImage(templateId: string) {
    return firstValueFrom(
      this.http.get(this.apiUrl.build(`certificates/templates/${templateId}/preview`), {
        responseType: "arraybuffer"
      }).pipe(
        map(response => new Blob([response])),
        map(blob => window.URL.createObjectURL(blob)),
        map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
      )
    );
  }

  getCompetitiveCertificates(userId: string): Promise<CompetitiveModeCertificate[]> {
    return firstValueFrom(this.http.get<CompetitiveModeCertificate[]>(this.apiUrl.build(`user/${userId}/certificates/competitive`)));
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

  public async templateDelete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(this.apiUrl.build(`certificates/templates/${id}`)));
  }

  public templateList(): Promise<CertificateTemplateView[]> {
    return firstValueFrom(this.http.get<CertificateTemplateView[]>(this.apiUrl.build("certificates/templates")));
  }

  public templateCreate(template: UpsertCertificateTemplate): Promise<CertificateTemplateView> {
    return firstValueFrom(this.http.post<CertificateTemplateView>(this.apiUrl.build("certificates/templates"), template));
  }

  public templateUpdate(template: UpsertCertificateTemplate): Promise<CertificateTemplateView> {
    return firstValueFrom(this.http.put<CertificateTemplateView>(this.apiUrl.build(`certificates/templates/${template.id}`), template));
  }

  private coerceCompetitionModeString(mode: PlayerMode) {
    return mode == PlayerMode.competition ? "competitive" : "practice";
  }
}
