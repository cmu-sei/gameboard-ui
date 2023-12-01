import { ViewSystemNotification } from '@/api/system-notifications.models';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { Component, OnInit } from '@angular/core';
import { CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext } from '../components/create-edit-system-notification-modal/create-edit-system-notification-modal.component';

interface AdminSystemNotificationsContext {
  notifications$?: ViewSystemNotification
}

@Component({
  selector: 'app-notifications',
  templateUrl: './admin-system-notifications.component.html',
  styleUrls: ['./admin-system-notifications.component.scss']
})
export class AdminSystemNotificationsComponent implements OnInit {
  context?: AdminSystemNotificationsContext;

  constructor(private modalService: ModalConfirmService) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  protected handleCreateNotificationClick() {
    this.modalService.openComponent<CreateEditSystemNotificationModalComponent, CreatedEditSystemNotificationModalContext>({
      content: CreateEditSystemNotificationModalComponent,
      context: {}
    });
  }
}
