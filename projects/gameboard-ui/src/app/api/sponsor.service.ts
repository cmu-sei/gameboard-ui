// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChangedSponsor, NewSponsor, Sponsor } from './sponsor-models';
import { MimeTypes } from '../../tools';

@Injectable({ providedIn: 'root' })
export class SponsorService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
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

  public list(search?: any): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.url + '/sponsors', { params: search });
  }

  public retrieve(id: string): Observable<Sponsor> {
    return this.http.get<Sponsor>(`${this.url}/sponsor/${id}`);
  }

  public create(model: NewSponsor): Observable<Sponsor> {
    const formData = new FormData();
    formData.append("name", model.name);

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

  public getDefaultLogoUri(): string {
    return `${this.config.basehref}assets/sponsor.svg`;
  }
}
