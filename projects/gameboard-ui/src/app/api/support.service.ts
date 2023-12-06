// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, first, last, map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChallengeOverview } from './board-models';
import { PlayerService } from './player.service';
import { AttachmentFile, ChangedTicket, NewTicket, NewTicketComment, Ticket, TicketActivity, TicketSummary } from './support-models';
import { UserSummary } from './user-models';
import { Search } from './models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  url = '';
  seenMap: Seen[] = [];
  seenStart = new Date();

  constructor(
    private http: HttpClient,
    private playerService: PlayerService,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<TicketSummary[]> {
    return this.http.get<TicketSummary[]>(`${this.url}/ticket/list`, { params: search }).pipe(
      map(r => this.transform(r))
    );
  }

  public retrieve(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/ticket/${id}`).pipe(
      tap(r => this.seen(r.key)),
      tap(ticket => {
        // fix up attachments properties
        ticket.attachmentFiles = this.attachmentsToAttachmentFiles(ticket.attachments, ticket.id);

        for (const activity of ticket.activity || []) {
          activity.attachmentFiles = this.attachmentsToAttachmentFiles(activity.attachments || [], `${ticket.id}/${activity.id}`);
        }
      })
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
        payload.append(key, { ...model as any }[key]);
    });
    if (model.uploads && model.uploads.length) {
      model.uploads.forEach(file => {
        payload.append('uploads', file, file.name);
      });
    }
    return this.http.post<TicketActivity>(`${this.url}/ticket/comment`, payload);
  }

  public upload(model: NewTicket): Observable<Ticket> {
    const payload: FormData = new FormData();
    Object.keys(model).forEach(key => {
      if (key != "uploads")
        payload.append(key, { ...model as any }[key]);
    });
    if (model.uploads && model.uploads.length) {
      model.uploads.forEach(file => {
        payload.append('uploads', file, file.name);
      });
    }
    return this.http.post<Ticket>(`${this.url}/ticket`, payload);
  }

  public listAttachments(id: string): Observable<AttachmentFile[]> {
    return this.http.get<AttachmentFile[]>(`${this.url}/ticket/${id}/attachments`);
  }

  public listSupport(search: any): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/users/support`, { params: search });
  }

  public listLabels(search: Search | null = null): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/ticket/labels`, { params: search as any });
  }

  public listUserChallenges(search: any): Observable<ChallengeOverview[]> {
    return this.http.get<ChallengeOverview[]>(`${this.url}/userchallenges`, { params: search });
  }

  // TODO: use this to make ajax request instead of requesting directly from img/iframe [src]
  // which doesn't include token for static file auth
  public getFile(fileUrl: string): Observable<Blob> {
    return this.http.get<Blob>(`${fileUrl}`, { params: { responseType: 'blob' } }).pipe();
  }

  public seen(key: number): void {
    const ts = new Date();
    const f = this.seenMap.find(s => s.key === key);
    if (!!f) {
      f.ts = ts;
    } else {
      this.seenMap.push({ key, ts });
    }
  }

  getTicketMarkdown = (ticket: Ticket): Observable<string> =>
    this.playerService.getTeam(ticket.teamId).pipe(
      catchError(err => {
        return of(null);
      }),
      first(),
      map(t => {
        const isTeam = !!t;
        const uriBase = this.config.absoluteUrl;

        // resolve last ticket activity
        const lastTicketActivity = ticket.activity.length > 0 ? ticket.activity[0] : null;
        let activitySection = `*none yet*`;

        if (lastTicketActivity) {
          const parsedDate = new Date(Date.parse(lastTicketActivity.timestamp));
          activitySection = `${lastTicketActivity.message}

          -- ${lastTicketActivity.user.approvedName} (${parsedDate.toDateString()} @ ${parsedDate.toLocaleTimeString()})
          **Attachments:** ${this.getAttachmentsMarkdown(uriBase, lastTicketActivity.attachmentFiles)}`;
        }

        // attachments?
        let attachmentSection = "";
        if (ticket.attachmentFiles?.length) {
          attachmentSection = `**Attachments:** ${this.getAttachmentsMarkdown(uriBase, ticket.attachmentFiles)}`;
        }

        // templatize and return
        return `
          ## Gameboard Ticket: ${ticket.fullKey}
          ### ${ticket.summary}

          **Created for:** _${isTeam ? "Player" : "Team"}:_ ${ticket.player?.approvedName} / _Game:_ [${ticket.challenge?.gameName}](${uriBase}game/${ticket.challenge?.gameId}) / _Challenge:_ [${ticket.challenge?.name}](${uriBase}admin/support?search=${ticket.challengeId})
          **Status:** ${ticket.status}
          **Assigned to:** ${ticket.assignee?.approvedName || "_unassigned_"}
          ${attachmentSection}

          #### Description
          ${ticket.description}

          #### Last activity
          ${activitySection}

          ***
          View this on [Gameboard](${uriBase}support/tickets/${ticket.key})
        `.trim()
          .split("\n")
          .map(line => line.trim())
          .join("\n");
      })
    );

  private getAttachmentsMarkdown(uriBase: string, attachments: AttachmentFile[]): string {
    if (!attachments?.length) {
      return "";
    }

    if (attachments.length == 1) {
      const attachment = attachments[0];
      return `[${attachment.filename}](${attachment.absoluteUrl})`;
    }

    return attachments.map(f => `\n- [${f.filename}](${f.absoluteUrl})`).join("");
  }

  private attachmentsToAttachmentFiles(fileNames: string[], serverPath: string): AttachmentFile[] {
    return fileNames.map(fileName => {
      let ext = fileName.split('.').pop() || "";
      let fullPath = `${this.config.supporthost}/${serverPath}/${fileName}`;

      const attachmentFile = {
        filename: fileName,
        extension: ext,
        fullPath: fullPath,
        absoluteUrl: `${this.config.absoluteUrl}/supportfiles/${serverPath}/${fileName}`,

        // This should be composed of images only
        showPreview: !!ext.toLowerCase().match(/(png|jpeg|jpg|gif|webp|svg)/)
      };

      return attachmentFile;
    });
  }

  private transform = (list: TicketSummary[]) => {
    list.forEach(t => {
      t.lastSeen = this.seenMap.find(s => s.key === t.key)?.ts || this.seenStart;
      t.lastUpdated = new Date(t.lastUpdated);
    });
    return list;
  };
}

class Seen {
  key!: number;
  ts!: Date;
}
