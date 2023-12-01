import { CreateEditSystemNotification, SystemNotificationType } from '@/api/system-notifications.models';
import { SystemNotificationsService } from '@/api/system-notifications.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CreatedEditSystemNotificationModalContext {
  model?: CreateEditSystemNotification;
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
    this.context = this.context || {
      model: {
        title: "",
        markdownContent: "",
        notificationType: "generalInfo"
      }
    };
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
}
