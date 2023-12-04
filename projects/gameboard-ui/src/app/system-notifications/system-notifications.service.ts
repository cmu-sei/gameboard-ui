import { Injectable } from '@angular/core';
import { AdminViewSystemNotification, CreateEditSystemNotification, ViewSystemNotification } from './system-notifications.models';
import { Observable, filter, firstValueFrom, switchMap } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';
import { UserService as LocalUserService } from "@/utility/user.service";

export type SystemNotificationInteractionType = "sawCallout" | "sawFull" | "dismissed";

@Injectable({ providedIn: 'root' })
export class SystemNotificationsService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient,
    private localUser: LocalUserService) { }

  public createNotification(createNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    const model = { ...createNotification, id: undefined };

    return this.http.post<ViewSystemNotification>(this.apiUrl.build("system-notifications"), model);
  }

  public logInteraction(notificationId: string, interactionType: SystemNotificationInteractionType) {
    return this.http.post(this.apiUrl.build(`system-notifications/${notificationId}/interaction`), { interactionType });
  }

  public updateNotification(updateNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    return this.http.put<ViewSystemNotification>(this.apiUrl.build(`system-notifications/${updateNotification.id}`), updateNotification);
  }

  public getVisibleNotifications(): Observable<ViewSystemNotification[]> {
    return this.localUser.user$.pipe(
      filter(u => !!u),
      switchMap(u => this.http.get<ViewSystemNotification[]>(this.apiUrl.build("system-notifications"))
      )
    );
  }

  public getAllNotifications(): Observable<AdminViewSystemNotification[]> {
    return this.http.get<AdminViewSystemNotification[]>(this.apiUrl.build("admin/system-notifications"));
  }
}
