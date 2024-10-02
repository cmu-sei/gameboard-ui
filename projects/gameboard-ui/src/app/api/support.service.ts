// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, first, last, map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { ChallengeOverview } from './board-models';
import { PlayerService } from './player.service';
import { AttachmentFile, ChangedTicket, NewTicket, NewTicketComment, SupportSettings, SupportSettingsAutoTagViewModel, Ticket, TicketActivity, TicketSummary, UpsertSupportSettingsAutoTagRequest } from './support-models';
import { Search, SimpleEntity } from './models';
import { ApiUrlService } from '@/services/api-url.service';
import { cloneNonNullAndDefinedProperties } from '@/../tools/object-tools.lib';
import { Team } from './player-models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  url = '';
  seenMap: Seen[] = [];
  seenStart = new Date();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private playerService: PlayerService,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<TicketSummary[]> {
    const params = !search ? {} : cloneNonNullAndDefinedProperties(search);
    return this.http.get<TicketSummary[]>(`${this.url}/ticket/list`, { params }).pipe(
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

  public deleteAutoTag(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/support/settings/autotag/${id}`));
  }

  public getAutoTags(): Promise<SupportSettingsAutoTagViewModel[]> {
    return firstValueFrom(this.http.get<SupportSettingsAutoTagViewModel[]>(`${this.url}/support/settings/autotags`));
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
    const payload = new FormData();
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

  public upsertAutoTag(autoTag: UpsertSupportSettingsAutoTagRequest) {
    return firstValueFrom(this.http.post(`${this.url}/support/settings/autotag`, autoTag));
  }

  // TODO: use this to make ajax request instead of requesting directly from img/iframe [src]
  // which doesn't include token for static file auth
  public getFile(fileUrl: string): Observable<Blob> {
    return this.http.get<Blob>(`${fileUrl}`, { params: { responseType: 'blob' } }).pipe();
  }

  public getSupportCode(challengeId: string, tag: string) {
    return `${challengeId.slice(0, 8)} ${tag}`;
  }

  public listAttachments(id: string): Observable<AttachmentFile[]> {
    return this.http.get<AttachmentFile[]>(`${this.url}/ticket/${id}/attachments`);
  }

  public listLabels(search: Search | null = null): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/ticket/labels`, { params: search as any });
  }

  public listSupport(search: any): Observable<SimpleEntity[]> {
    return this.http.get<SimpleEntity[]>(`${this.url}/users/support`, { params: search });
  }

  public listUserChallenges(search: any): Observable<ChallengeOverview[]> {
    return this.http.get<ChallengeOverview[]>(`${this.url}/userchallenges`, { params: search });
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

  getSettings() {
    return this.http.get<SupportSettings>(this.apiUrl.build("support/settings"));
  }

  updateSettings(settings: SupportSettings) {
    return this.http.put<SupportSettings>(this.apiUrl.build("support/settings"), settings);
  }

  async getTicketMarkdown(ticket: Ticket): Promise<string> {
    let team: Team | null = null;

    if (ticket.teamId) {
      team = await firstValueFrom(this.playerService.getTeam(ticket.teamId));
    }

    const isTeam = !!team;
    const uriBase = this.config.absoluteUrl;

    // resolve last ticket activity
    const lastTicketActivity = ticket.activity.length > 0 ? ticket.activity[0] : null;
    let activitySection = `_none yet_`;

    if (lastTicketActivity) {
      const parsedDate = new Date(Date.parse(lastTicketActivity.timestamp));
      const attachmentsContent = this.getAttachmentsMarkdown(uriBase, lastTicketActivity.attachmentFiles);

      activitySection = `${lastTicketActivity.message || "_(no comment)_"}

          -- ${lastTicketActivity.user.name} (${parsedDate.toDateString()} @ ${parsedDate.toLocaleTimeString()})

          ${attachmentsContent ? `**Attachments:** ${attachmentsContent}` : ""}`;
    }

    // attachments?
    let attachmentSection = "";
    if (ticket.attachmentFiles?.length) {
      attachmentSection = `**Attachments:** ${this.getAttachmentsMarkdown(uriBase, ticket.attachmentFiles)}`;
    }

    // associated game/challenge?
    let gameDescription = "";
    let challengeDescription = "";
    let supportCodeContent = "";

    if (ticket.challenge) {
      const adminChallengeLink = `${uriBase}admin/support?search=${ticket.challengeId}`;
      gameDescription = ` / _Game:_ [${ticket.challenge?.gameName}](${uriBase}game/${ticket.challenge?.gameId})`;
      challengeDescription = ` / _Challenge:_ [${ticket.challenge?.name}](adminChallengeLink)`;

      if (ticket.challenge.tag) {
        const supportCode = this.getSupportCode(ticket.challenge.id, ticket.challenge.tag);
        supportCodeContent = `**Support Code:** [${supportCode}](${adminChallengeLink})`;
      }
    }

    // templatize and return
    return `
          ## Gameboard Ticket: ${ticket.fullKey}
          ### ${ticket.summary}

          **Created for:** _${isTeam ? "Player" : "Team"}:_ ${ticket.player?.approvedName || ticket.requester?.name}${gameDescription}${challengeDescription}
          **Status:** ${ticket.status}
          **Assigned to:** ${ticket.assignee?.name || "_Unassigned_"}
          ${supportCodeContent}
          ${attachmentSection}

          #### Description
          ${ticket.description}

          #### Last activity
          ${activitySection}

          ***
          View this ticket on [${this.config.appName}](${uriBase}support/tickets/${ticket.key})
        `.trim()
      .split("\n")
      .map(line => line.trim())
      .join("\n");
  }

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
