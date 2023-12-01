import { Injectable } from '@angular/core';
import { CreateEditSystemNotification, ViewSystemNotification } from './system-notifications.models';
import { Observable } from 'rxjs';
import { ApiUrlService } from '@/services/api-url.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SystemNotificationsService {
  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient) { }

  public createNotification(createNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    const model = { ...createNotification, id: undefined };

    return this.http.post<ViewSystemNotification>(this.apiUrl.build("system-notifications"), model);
  }

  public updateNotification(updateNotification: CreateEditSystemNotification): Observable<ViewSystemNotification> {
    return this.http.put<ViewSystemNotification>(this.apiUrl.build(`system-notifications/${updateNotification.id}`), updateNotification);
  }

  public getVisibleNotifications(userId: string): Observable<ViewSystemNotification[]> {
    return this.http.get<ViewSystemNotification[]>(this.apiUrl.build("system-notifications"));
  }
}
