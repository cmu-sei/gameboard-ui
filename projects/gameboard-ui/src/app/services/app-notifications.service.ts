import { ToastService } from '@/utility/services/toast.service';
import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { LogService } from './log.service';
import { WindowService } from './window.service';
import { ConfigService } from '@/utility/config.service';

export type CanSendNotificationsResult = "denied" | "pending" | "unsupported" | "allowed";

/** 
 * Makes use of the browser Notification API to send the user OS-level notifications from Gameboard. Currently only used for Support personnel (and disabled for standard users). 
 * 
 * If the user doesn't grant the Notification permission to Gameboard, this service falls back to using the ToastService to show related notifications.
 * */
@Injectable({ providedIn: 'root' })
export class AppNotificationsService {
  constructor(
    private config: ConfigService,
    private log: LogService,
    private toastService: ToastService,
    private windowService: WindowService) { }

  canSendNotifications(): Observable<CanSendNotificationsResult> {
    if (!("Notification" in window)) {
      return of("unsupported");
    }

    if (!Notification || Notification.permission === 'denied')
      return of("denied");

    if (Notification.permission === 'granted')
      return of("allowed");

    return from(Notification.requestPermission()).pipe(map(permission => this.toCanSendNotifications(permission)));
  }

  private toCanSendNotifications(permission: NotificationPermission): CanSendNotificationsResult {
    switch (permission) {
      case "denied":
        return "denied";
      case "granted":
        return "allowed";
    }

    return "pending";
  }

  private send(config: { title: string, body: string, appUrl?: string }): Observable<void> {
    return this.canSendNotifications().pipe(
      map(result => {
        if (result !== "allowed") {
          this.log.logWarning(`Can't send browser notification (${result}) - falling back to toast.`);
          this.toastService.showMessage(`${config.title}: ${config.body}`);
          return;
        }

        const sup: NotificationOptions = {};
        const thing = new Notification(config.title, { body: config.body });

        if (config.appUrl) {
          thing.onclick = (event) => {
            event.preventDefault();
            this.windowService.get().open(`${this.config.apphost}/${config.appUrl}`);
          };
        }
      })
    );
  }
}
