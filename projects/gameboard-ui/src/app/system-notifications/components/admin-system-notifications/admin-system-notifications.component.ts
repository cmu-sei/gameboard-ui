import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminViewSystemNotification } from '@/system-notifications/system-notifications.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext } from '../create-edit-system-notification-modal/create-edit-system-notification-modal.component';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';

interface AdminSystemNotificationsContext {
  notifications$?: Observable<AdminViewSystemNotification[]>
}

@Component({
  selector: 'app-notifications',
  templateUrl: './admin-system-notifications.component.html',
  styleUrls: ['./admin-system-notifications.component.scss']
})
export class AdminSystemNotificationsComponent implements OnInit {
  context?: AdminSystemNotificationsContext;

  constructor(
    private modalService: ModalConfirmService,
    private systemNotificationsService: SystemNotificationsService) { }

  ngOnInit(): void {
    this.context = this.load();
  }

  protected handleCreateNotificationClick() {
    this.modalService.openComponent<CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext>({
      content: CreateEditSystemNotificationModalComponent,
      context: {
        model: {
          markdownContent: "",
          notificationType: "generalInfo",
          title: ""
        }
      }
    });
  }

  protected handleEditNotificationClick(notification: AdminViewSystemNotification) {
    this.modalService.openComponent<CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext>({
      content: CreateEditSystemNotificationModalComponent,
      context: {
        model: { ...notification }
      }
    });
  }

  private load(): AdminSystemNotificationsContext {
    return { notifications$: this.systemNotificationsService.getAllNotifications() };
  }
}
