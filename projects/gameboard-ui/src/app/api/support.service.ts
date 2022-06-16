// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChallengeOverview } from './board-models';
import { Feedback, FeedbackReportDetails, FeedbackSubmission } from './feedback-models';
import { AttachmentFile, ChangedTicket, NewTicket, NewTicketComment, Ticket, TicketActivity, TicketSummary } from './support-models';
import { UserSummary } from './user-models';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<TicketSummary[]> {
    return this.http.get<TicketSummary[]>(`${this.url}/ticket/list`, {params: search});
  }

  public retrieve(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/ticket/${id}`);
  }
  
  public create(model: NewTicket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.url}/ticket`, model);
  }
  
  public update(model: ChangedTicket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.url}/ticket`, model);
  }
  
  public comment(model: NewTicketComment): Observable<Ticket> {
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
    return this.http.post<Ticket>(`${this.url}/ticket/comment`, payload);
  }
  
  public upload(model: NewTicket): Observable<TicketActivity> {
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
    return this.http.post<TicketActivity>(`${this.url}/ticket`, payload);
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

  // public staticFile(): Observable<string> {
  //   return this.http.get<string>(`${this.url}/ticket/${id}/attachments`);
  // }

}
