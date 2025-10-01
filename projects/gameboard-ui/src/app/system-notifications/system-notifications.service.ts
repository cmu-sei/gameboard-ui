// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, filter, map, switchMap, tap } from 'rxjs';
import { AdminViewSystemNotification, CreateEditSystemNotification, ViewSystemNotification } from './system-notifications.models';
import { ApiUrlService } from '@/services/api-url.service';
import { UserService as LocalUserService } from "@/utility/user.service";

export type SystemNotificationInteractionType = "sawCallout" | "sawFull" | "dismissed";

@Injectable({ providedIn: 'root' })
export class SystemNotificationsService {
  private _systemNotificationsUpdated$ = new Subject<void>();
  public systemNotificationsUpdated$ = this._systemNotificationsUpdated$.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private localUser: LocalUserService) { }

  public createNotification(createNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    const model = { ...createNotification, id: undefined };

    return this.http.post<ViewSystemNotification>(this.apiUrl.build("system-notifications"), model).pipe(
      tap(newNotification => this._systemNotificationsUpdated$.next())
    );
  }

  public deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl.build(`system-notifications/${id}`)).pipe(
      tap(() => this._systemNotificationsUpdated$.next())
    );
  }

  public getVisibleNotifications(): Observable<ViewSystemNotification[]> {
    return this.localUser.user$.pipe(
      filter(u => !!u),
      switchMap(u => this.http.get<ViewSystemNotification[]>(this.apiUrl.build("system-notifications")))
    );
  }

  public getAllNotifications(): Observable<AdminViewSystemNotification[]> {
    return this.http.get<AdminViewSystemNotification[]>(this.apiUrl.build("admin/system-notifications")).pipe(
      map(notifications => {
        for (const notification of notifications) {
          if (notification.startsOn)
            notification.startsOn = new Date(Date.parse(notification.startsOn as any));

          if (notification.endsOn)
            notification.endsOn = new Date(Date.parse(notification.endsOn as any));
        }

        return notifications;
      })
    );
  }

  public logInteraction(interactionType: SystemNotificationInteractionType, ...notificationIds: string[]) {
    return this.http.post(this.apiUrl.build(`system-notifications/interaction`), { systemNotificationIds: notificationIds, interactionType });
  }

  public updateNotification(updateNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    return this.http.put<ViewSystemNotification>(this.apiUrl.build(`system-notifications/${updateNotification.id}`), updateNotification);
  }
}
