import { AppNotificationsService, CanUseBrowserNotificationsResult } from '@/services/app-notifications.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ConfigService } from '@/utility/config.service';
import { Component } from '@angular/core';
import { Observable, first } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  protected appName = "Gameboard";
  protected canUseBrowserNotifications$: Observable<CanUseBrowserNotificationsResult>;

  constructor(
    config: ConfigService,
    private appNotificationsService: AppNotificationsService,
    private modalService: ModalConfirmService) {
    this.appName = config.appName;
    this.canUseBrowserNotifications$ = appNotificationsService.canShowBrowserNotifications$;
  }

  protected requestNotificationPermission() {
    this.appNotificationsService.requestPermission().pipe(first()).subscribe(permission => {
      if (permission === "allowed")
        this.showTestNotification();
    });
  }

  protected showAboutBrowserNotifications() {
    this.modalService.openConfirm({
      bodyContent: `
        You can optionally allow ${this.appName} to send browser notifications. If you do, you'll receive device-level
        alerts when important events happen (like when a new Support ticket is created.)

        You can revoke this permission at any time from here or using your browser's privacy controls. ${this.appName}
        can also instead send these notifications as simple on-page notifications, but note that these won't be
        visible from other browser tabs.
      `,
      hideCancel: true,
      renderBodyAsMarkdown: true
    });
  }

  protected showTestNotification() {
    this.appNotificationsService.send({
      title: `Test ${this.appName} Notification`,
      body: "This is what a browser notification will look like. Pretty spiffy, huh?",
      appUrl: "admin",
      tag: "test"
    });
  }
}
