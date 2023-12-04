import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ViewSystemNotification } from '@/system-notifications/system-notifications.models';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';
import { Component } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-system-notifications',
  templateUrl: './system-notifications.component.html',
  styleUrls: ['./system-notifications.component.scss']
})
export class SystemNotificationsComponent {
  notifications$: Observable<ViewSystemNotification[]>;

  constructor(
    private modalService: ModalConfirmService,
    private systemNotificationsService: SystemNotificationsService) {
    this.notifications$ = systemNotificationsService.getVisibleNotifications().pipe(
      tap(notifications => {

      })
    );
  }

  protected async handleClosed(notification: ViewSystemNotification) {
    await firstValueFrom(this.systemNotificationsService.logInteraction(notification.id, "dismissed"));
  }

  protected async handleClicked(notification: ViewSystemNotification) {
    // tODO: show modal
    this.modalService.openConfirm({
      title: notification.title,
      bodyContent: notification.markdownContent,
      renderBodyAsMarkdown: true
    });
    await firstValueFrom(this.systemNotificationsService.logInteraction(notification.id, "sawFull"));
  }
}
