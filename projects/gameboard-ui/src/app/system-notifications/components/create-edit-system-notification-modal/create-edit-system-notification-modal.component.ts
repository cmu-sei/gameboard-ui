import { CreateEditSystemNotification, SystemNotificationType } from '@/system-notifications/system-notifications.models';
import { SystemNotificationsService } from '@/system-notifications/system-notifications.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CreatedEditSystemNotificationModalContext {
  model: CreateEditSystemNotification;
  onSave: () => void;
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
          isDismissible: true,
          notificationType: "generalInfo"
        },
        onSave: () => new Promise(() => { })
      };
    }
  }

  protected close() {
    this.modalService.hide();
  }

  protected async handleSave(model: CreateEditSystemNotification) {
    model.isDismissible = model.isDismissible || false;
    if (model.id)
      await firstValueFrom(this.systemNotificationsService.updateNotification(model));
    else
      await firstValueFrom(this.systemNotificationsService.createNotification(model));

    this.context?.onSave();
    this.close();
  }

  protected handleTypeClick(type: SystemNotificationType) {
    if (!this.context)
      throw new Error("Can't set the type - no notification is being created.");

    this.context.model.notificationType = type;
  }

  protected isValid(model: CreateEditSystemNotification): boolean {
    return !!model.title && !!model.markdownContent;
  }
}
