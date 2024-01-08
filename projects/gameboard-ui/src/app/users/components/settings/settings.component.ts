import { UserService } from '@/api/user.service';
import { AppNotificationsService, CanUseBrowserNotificationsResult } from '@/services/app-notifications.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ConfigService } from '@/utility/config.service';
import { Component, OnInit } from '@angular/core';
import { Observable, first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  protected appName = "Gameboard";
  protected canUseBrowserNotifications$: Observable<CanUseBrowserNotificationsResult>;
  protected playAudioOnBrowserNotification = false;

  constructor(
    config: ConfigService,
    private appNotificationsService: AppNotificationsService,
    private modalService: ModalConfirmService,
    private userService: UserService) {
    this.appName = config.appName;
    this.canUseBrowserNotifications$ = appNotificationsService.canShowBrowserNotifications$;
  }

  async ngOnInit(): Promise<void> {
    const userSettings = await firstValueFrom(this.userService.getSettings());
    this.playAudioOnBrowserNotification = userSettings.playAudioOnBrowserNotification;
  }

  protected async handlePlayAudioOnBrowserNotificationChange(shouldPlay: boolean) {
    await firstValueFrom(this.userService.updateSettings({ playAudioOnBrowserNotification: shouldPlay }));
  }

  protected requestNotificationPermission() {
    this.appNotificationsService.requestPermission().pipe(first()).subscribe(permission => {
      if (permission === "allowed")
        this.showTestNotification();
    });
  }

  protected showAboutBrowserNotifications() {
    this.modalService.openConfirm({
      title: "About browser notifications",
      bodyContent: `
        Browser notifications are a feature of most browsers that allow web applications like ${this.appName} to send notifications to
        your device's notification system. If you enable browser notifications, you'll get device-level alerts when important
        events happen (like when a new Support ticket is created). This works even if you're not actively using a ${this.appName} tab (though you do
        need to have at least one open).

        You can revoke this permission at any time using your browser's privacy controls. If you do, ${this.appName}
        will instead send these notifications as simple and silent on-page notifications, but note that these won't be
        visible from other browser tabs.
      `,
      hideCancel: true,
      renderBodyAsMarkdown: true
    });
  }

  protected showTestNotification() {
    this.appNotificationsService.send({
      title: `Test ${this.appName} Notification`,
      body: `This is what a browser notification from ${this.appName} will look like. Pretty handy, huh?`,
      appUrl: "user/settings",
      // we randomize the notification tag here in order to allow most devices to repeat it without it being dismissed.
      // this allows users to preview the notification multiple times with multiple clicks.
      tag: `test-${Math.random()}`
    });
  }
}
