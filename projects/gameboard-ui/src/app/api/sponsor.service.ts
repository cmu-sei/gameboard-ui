// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChangedSponsor, NewSponsor, Sponsor, SponsorWithChildSponsors, SponsorWithParent } from './sponsor-models';
import { MimeTypes } from '../../tools';
import { ApiUrlService } from '@/services/api-url.service';

export interface SponsorSearch {
  hasParent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SponsorService {
  url = '';

  constructor(
    private apiUrl: ApiUrlService,
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.url = config.apphost + 'api';
  }

  public get allowedMimeTypes(): string[] {
    return [
      MimeTypes.Gif,
      MimeTypes.Jpeg,
      MimeTypes.Png,
      MimeTypes.Svg,
      MimeTypes.Webp
    ];
  }

  public list(search?: SponsorSearch): Observable<SponsorWithParent[]> {
    return this.http.get<SponsorWithParent[]>(this.url + '/sponsors', { params: { ...(search || {}) } });
  }

  public listWithChildren(): Observable<SponsorWithChildSponsors[]> {
    return this.http.get<SponsorWithChildSponsors[]>(this.apiUrl.build("sponsors/with-children"));
  }

  public create(model: NewSponsor): Observable<Sponsor> {
    return this.http.post<Sponsor>(this.apiUrl.build("sponsor"), model);
  }

  public setAvatar(sponsorId: string, avatarFile: File) {
    if (!avatarFile) {
      throw new Error(`Can't update sponsor ${sponsorId}'s avatar with falsey avatarFile.`);
    }

    if (this.allowedMimeTypes.indexOf(avatarFile.type) < 0) {
      throw new Error(`File type ${avatarFile.type} isn't permitted for sponsor logos.`);
    }

    const formData = new FormData();
    formData.append("avatarFile", avatarFile);

    return this.http.put<void>(this.apiUrl.build(`sponsor/${sponsorId}/avatar`), formData);
  }

  public update(model: ChangedSponsor): Observable<Sponsor> {
    return this.http.put<Sponsor>(`${this.url}/sponsor`, model);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/sponsor/${id}`);
  }

  public resolveAbsoluteSponsorLogoUri(logoFileName: string | undefined | null) {
    return !!logoFileName ?
      `${this.config.imagehost}/${logoFileName}` :
      `${this.config.basehref}assets/sponsor.svg`;
  }
}
