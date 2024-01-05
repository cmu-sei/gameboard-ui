import { ToastService } from '@/utility/services/toast.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, of, tap } from 'rxjs';
import { LogService } from './log.service';
import { WindowService } from './window.service';
import { ConfigService } from '@/utility/config.service';

export type CanUseBrowserNotificationsResult = "denied" | "pending" | "unsupported" | "allowed";

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

  private _canShowBrowserNotifications$ = new BehaviorSubject<CanUseBrowserNotificationsResult>(this.resolveCanSendBrowserNotifications());
  public canShowBrowserNotifications$ = this._canShowBrowserNotifications$.asObservable();

  requestPermission(): Observable<CanUseBrowserNotificationsResult> {
    if (this._canShowBrowserNotifications$.value !== "pending")
      return this._canShowBrowserNotifications$;

    return from(Notification.requestPermission()).pipe(
      map(permission => this.toCanSendNotifications(permission)),
      tap(canSendResult => this._canShowBrowserNotifications$.next(canSendResult))
    );
  }

  private resolveCanSendBrowserNotifications(): CanUseBrowserNotificationsResult {
    if (!("Notification" in window)) {
      return "unsupported";
    }

    if (!Notification || Notification.permission === 'denied')
      return "denied";

    if (Notification.permission === 'granted')
      return "allowed";

    return "pending";
  }

  public send(config: { title: string, body: string, appUrl?: string }) {
    if (this._canShowBrowserNotifications$.value !== "allowed") {
      this.log.logWarning(`Can't send browser notification (${this._canShowBrowserNotifications$.value}) - falling back to toast.`);
      this.toastService.showMessage(`${config.title}: ${config.body}`);
      return;
    }

    const notification = new Notification(config.title, { body: config.body, icon: "assets/img/unity.png", tag: "1234", });
    notification.onerror = err => {
      this.log.logError(`Error showing browser notification:`, err);
    };

    if (config.appUrl) {
      notification.onclick = (event) => {
        event.preventDefault();
        this.windowService.get().open(`${this.config.apphost}/${config.appUrl}`);
      };
    }
  }

  private toCanSendNotifications(permission: NotificationPermission): CanUseBrowserNotificationsResult {
    switch (permission) {
      case "denied":
        return "denied";
      case "granted":
        return "allowed";
    }

    return "pending";
  }
}
