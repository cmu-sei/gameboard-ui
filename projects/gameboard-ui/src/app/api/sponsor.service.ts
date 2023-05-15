// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChangedSponsor, NewSponsor, Sponsor } from './sponsor-models';

@Injectable({ providedIn: 'root' })
export class SponsorService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search?: any): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.url + '/sponsors', { params: search }).pipe(
      map(r => {
        r.forEach(g => this.transform(g));
        return r;
      })
    );
  }

  public retrieve(id: string): Observable<Sponsor> {
    return this.http.get<Sponsor>(`${this.url}/sponsor/${id}`).pipe(
      map(r => this.transform(r))
    );
  }

  public create(model: NewSponsor): Observable<Sponsor> {
    return this.http.post<Sponsor>(`${this.url}/sponsor`, model);
  }

  public createAll(model: ChangedSponsor[]): Observable<any> {
    return this.http.post<any>(`${this.url}/sponsors`, model);
  }

  public update(model: Sponsor): Observable<any> {
    return this.http.put<any>(`${this.url}/sponsor`, model);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/sponsor/${id}`);
  }

  public upload(file: File): Observable<Sponsor> {
    const payload: FormData = new FormData();
    payload.append('file', file, file.name);
    return this.http.post<Sponsor>(`${this.url}/sponsor/image`, payload);
  }

  public getLogoUrl(logo: string): string {
    const logoUrl = logo
      ? `${this.config.imagehost}/${logo}`
      : `${this.config.basehref}assets/sponsor.svg`
      ;
    return logoUrl;
  }

  private transform(sponsor: Sponsor): Sponsor {
    sponsor.logoUrl = this.getLogoUrl(sponsor.logo);
    return sponsor;
  }
}
