// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChangedSponsor, GetSponsorsByParentResponse, NewSponsor, Sponsor, SponsorWithParent } from './sponsor-models';
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

  public listByParent(): Observable<GetSponsorsByParentResponse> {
    return this.http.get<GetSponsorsByParentResponse>(this.apiUrl.build("sponsors/by-parent"));
  }

  public create(model: NewSponsor): Observable<Sponsor> {
    const formData = new FormData();
    formData.append("name", model.name);

    if (model.parentSponsorId)
      formData.append("parentSponsorId", model.parentSponsorId);

    if (model.logoFile) {
      if (this.allowedMimeTypes.indexOf(model.logoFile.type) < 0) {
        throw new Error(`File type ${model.logoFile.type} isn't permitted for sponsor logos.`);
      }

      formData.append("logoFile", model.logoFile);
    }

    return this.http.post<Sponsor>(`${this.url}/sponsor`, formData);
  }

  public update(model: ChangedSponsor): Observable<any> {
    return this.http.put<any>(`${this.url}/sponsor`, model);
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
