import { Injectable, OnDestroy } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, firstValueFrom, from, groupBy, map, mergeMap, tap, throttleTime } from 'rxjs';
import { ToastService } from '@/utility/services/toast.service';
import { LogService } from './log.service';
import { WindowService } from './window.service';
import { ConfigService } from '@/utility/config.service';
import { UserService } from '@/api/user.service';

export type CanUseBrowserNotificationsResult = "denied" | "pending" | "unsupported" | "allowed";

export interface SendAppNotification {
  title: string,
  body: string,
  appUrl?: string | UrlTree,
  tag?: string
}

/** 
 * Makes use of the browser Notification API to send the user OS-level notifications from Gameboard. Currently only used for Support personnel (and disabled for standard users). 
 * 
 * If the user doesn't grant the Notification permission to Gameboard, this service falls back to using the ToastService to show related notifications.
 * */
@Injectable({ providedIn: 'root' })
export class AppNotificationsService implements OnDestroy {
  constructor(
    private config: ConfigService,
    private log: LogService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private windowService: WindowService) {
    this._sendAppNotificationSubscription = this._sendAppNotification$
      .pipe(
        groupBy(n => n.title),
        mergeMap(groups => groups.pipe(throttleTime(2000)))
      ).subscribe(sendNotification => this.onAppNotificationSend(sendNotification));

    this._userSettingsSubscription = this.userService.settingsUpdated$.subscribe(settings => this._playAudioOnBrowserNotification = settings.playAudioOnBrowserNotification);
  }

  private _canShowBrowserNotifications$ = new BehaviorSubject<CanUseBrowserNotificationsResult>(this.resolveCanSendBrowserNotifications());
  public canShowBrowserNotifications$ = this._canShowBrowserNotifications$.asObservable();

  private _playAudioOnBrowserNotification?: boolean;
  private _sendAppNotification$ = new Subject<SendAppNotification>();
  private _sendAppNotificationSubscription?: Subscription;
  private _userSettingsSubscription?: Subscription;

  ngOnDestroy(): void {
    this._sendAppNotificationSubscription?.unsubscribe();
    this._userSettingsSubscription?.unsubscribe();
  }

  requestPermission(): Observable<CanUseBrowserNotificationsResult> {
    if (this._canShowBrowserNotifications$.value !== "pending")
      return this._canShowBrowserNotifications$;

    return from(Notification.requestPermission()).pipe(
      map(permission => this.toCanSendNotifications(permission)),
      tap(canSendResult => this._canShowBrowserNotifications$.next(canSendResult))
    );
  }

  public send(config: SendAppNotification) {
    this._sendAppNotification$.next(config);
  }

  private async onAppNotificationSend(sendNotification: SendAppNotification) {
    if (this._canShowBrowserNotifications$.value !== "allowed") {
      this.log.logWarning(`Can't send browser notification (${this._canShowBrowserNotifications$.value}) - falling back to toast.`);
      this.toastService.show({
        text: `${sendNotification.title}: ${sendNotification.body}`,
        onClick: sendNotification.appUrl ? () => this.router.navigateByUrl(sendNotification.appUrl!) : undefined,
      });
      return;
    }

    if (this._playAudioOnBrowserNotification === undefined) {
      const settings = await firstValueFrom(this.userService.getSettings());
      this._playAudioOnBrowserNotification = settings.playAudioOnBrowserNotification;
    }

    const notification = new Notification(sendNotification.title, {
      body: sendNotification.body,
      tag: sendNotification.tag,
    });

    // play audio notification (we only do this with the OS-level notification, because otherwise it's hard to know why the sound happened if you're
    // not looking at this window)
    if (this._playAudioOnBrowserNotification) {
      const audio = new Audio(`${this.config.absoluteUrl}assets/audio/browser-notification-chime.mp3`);
      audio.play();
    }

    notification.onerror = err => {
      this.log.logError(`Error showing browser notification:`, err);
    };

    if (sendNotification.appUrl) {
      notification.onclick = (event) => {
        event.preventDefault();
        this.windowService.get().open(`${this.config.absoluteUrl}${sendNotification.appUrl}`);
      };
    }
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
