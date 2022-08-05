// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { transformAll } from '@angular/compiler/src/render3/r3_ast';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChallengeOverview } from './board-models';
import { AttachmentFile, ChangedTicket, NewTicket, NewTicketComment, Ticket, TicketActivity, TicketSummary } from './support-models';
import { UserSummary } from './user-models';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  url = '';
  seenMap: Seen[] = [];
  seenStart = new Date();

  constructor(
    private http: HttpClient,
    config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<TicketSummary[]> {
    return this.http.get<TicketSummary[]>(`${this.url}/ticket/list`, {params: search}).pipe(
      map(r => this.transform(r))
    );
  }

  public retrieve(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/ticket/${id}`).pipe(
      tap(r => this.seen(r.key))
    );
  }

  public create(model: NewTicket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.url}/ticket`, model);
  }

  public update(model: ChangedTicket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.url}/ticket`, model);
  }

  public comment(model: NewTicketComment): Observable<TicketActivity> {
    const payload: FormData = new FormData();
    Object.keys(model).forEach(key => {
      if (key != "uploads")
        payload.append(key, {...model as any}[key]);
    });
    if (model.uploads && model.uploads.length) {
      model.uploads.forEach(file => {
        payload.append('uploads', file, file.name);
      })
    }
    return this.http.post<TicketActivity>(`${this.url}/ticket/comment`, payload);
  }

  public upload(model: NewTicket): Observable<Ticket> {
    const payload: FormData = new FormData();
    Object.keys(model).forEach(key => {
      if (key != "uploads")
        payload.append(key, {...model as any}[key]);
    });
    if (model.uploads && model.uploads.length) {
      model.uploads.forEach(file => {
        payload.append('uploads', file, file.name);
      })
    }
    return this.http.post<Ticket>(`${this.url}/ticket`, payload);
  }

  public listAttachments(id: string): Observable<AttachmentFile[]> {
    return this.http.get<AttachmentFile[]>(`${this.url}/ticket/${id}/attachments`);
  }

  public listSupport(search: any): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/users/support`, {params: search});
  }

  public listLabels(search: any): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/ticket/labels`, {params: search});
  }

  public listUserChallenges(search: any): Observable<ChallengeOverview[]> {
    return this.http.get<ChallengeOverview[]>(`${this.url}/userchallenges`, {params: search});
  }

  // TODO: use this to make ajax request instead of requesting directly from img/iframe [src]
  // which doesn't include token for static file auth
  public getFile(fileUrl: string): Observable<Blob> {
    return this.http.get<Blob>(`${fileUrl}`, {params: {responseType: 'blob'} }).pipe(

    );
  }

  public seen(key: number): void {
    const ts = new Date();
    const f = this.seenMap.find(s => s.key === key);
    if (!!f) {
      f.ts = ts;
    } else {
      this.seenMap.push({key, ts});
    }
  }

  private transform = (list: TicketSummary[]) => {
    list.forEach(t => {
      t.lastSeen = this.seenMap.find(s => s.key === t.key)?.ts || this.seenStart;
      t.lastUpdated = new Date(t.lastUpdated);
    });
    return list;
  }
}

class Seen {
  key!: number;
  ts!: Date;
}
