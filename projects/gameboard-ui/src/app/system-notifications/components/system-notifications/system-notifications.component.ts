import { Component, OnInit } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ViewSystemNotification } from '@/system-notifications/system-notifications.models';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-system-notifications',
  templateUrl: './system-notifications.component.html',
  styleUrls: ['./system-notifications.component.scss']
})
export class SystemNotificationsComponent implements OnInit {
  protected notifications: ViewSystemNotification[] = [];
  private UPDATE_INTERVAL = 1000 * 60 * 60 * 30;

  constructor(
    private localUserService: LocalUserService,
    private modalService: ModalConfirmService,
    private systemNotificationsService: SystemNotificationsService,
    private unsub: UnsubscriberService) { }

  async ngOnInit(): Promise<void> {
    this.unsub.add(
      this.localUserService.user$.subscribe(async u => {
        await this.loadNotifications();
      }),
      this.systemNotificationsService.systemNotificationsUpdated$.subscribe(async () => await this.loadNotifications()),
      timer(0, this.UPDATE_INTERVAL).subscribe(async u => await this.loadNotifications())
    );
  }

  protected async handleClosed(notification: ViewSystemNotification) {
    await firstValueFrom(this.systemNotificationsService.logInteraction("dismissed", notification.id));
  }

  protected async handleClicked(notification: ViewSystemNotification) {
    await firstValueFrom(this.systemNotificationsService.logInteraction("sawFull", notification.id));

    this.modalService.openConfirm({
      title: notification.title,
      bodyContent: notification.markdownContent,
      renderBodyAsMarkdown: true,
      hideCancel: true,
      onConfirm: async () => {
        await this.loadNotifications();
        await firstValueFrom(this.systemNotificationsService.logInteraction("dismissed", notification.id));
      }
    });
  }

  private async loadNotifications(): Promise<void> {
    if (!this.localUserService.user$.value) {
      this.notifications = [];
      return;
    }

    this.notifications = await firstValueFrom(this.systemNotificationsService.getVisibleNotifications());
    const shownNotificationIds = this.notifications.map(n => n.id);

    if (shownNotificationIds.length) {
      await firstValueFrom(this.systemNotificationsService.logInteraction("sawCallout", ...shownNotificationIds));
    }
  }
}
