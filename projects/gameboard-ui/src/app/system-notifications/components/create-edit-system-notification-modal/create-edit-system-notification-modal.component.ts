import { CreateEditSystemNotification, SystemNotificationType } from '@/system-notifications/system-notifications.models';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CreatedEditSystemNotificationModalContext {
  model: CreateEditSystemNotification;
}

@Component({
  selector: 'app-create-edit-system-notification-modal',
  templateUrl: './create-edit-system-notification-modal.component.html',
  styleUrls: ['./create-edit-system-notification-modal.component.scss']
})
export class CreateEditSystemNotificationModalComponent implements OnInit {
  context?: CreatedEditSystemNotificationModalContext;

  constructor(
    private modalService: ModalConfirmService,
    private systemNotificationsService: SystemNotificationsService) { }

  ngOnInit() {
    if (!this.context || !Object.keys(this.context).length) {
      this.context = {
        model: {
          title: "",
          markdownContent: "",
          notificationType: "generalInfo"
        }
      };
    }
  }

  protected close() {
    this.modalService.hide();
  }

  protected async handleSave(model: CreateEditSystemNotification) {
    if (model.id)
      await firstValueFrom(this.systemNotificationsService.updateNotification(model));
    else
      await firstValueFrom(this.systemNotificationsService.createNotification(model));

    this.close();
  }

  protected handleTypeClick(type: SystemNotificationType) {
    if (!this.context)
      throw new Error("Can't set the type - no notification is being created.");

    this.context.model.notificationType = type;
  }
}
