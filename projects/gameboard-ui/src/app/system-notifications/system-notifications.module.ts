import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSystemNotificationsComponent } from './components/admin-system-notifications/admin-system-notifications.component';
import { CreateEditSystemNotificationModalComponent } from './components/create-edit-system-notification-modal/create-edit-system-notification-modal.component';
import { SystemNotificationTypeToTextPipe } from './pipes/system-notification-type-to-text.pipe';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@/core/core.module';
import { SystemNotificationsComponent } from './components/system-notifications/system-notifications.component';
import { NotificationTypeToAlertTypePipe } from './pipes/notification-type-to-alert-type.pipe';

const DECLARED = [
  AdminSystemNotificationsComponent,
  CreateEditSystemNotificationModalComponent,
  SystemNotificationTypeToTextPipe,
  SystemNotificationsComponent
]

@NgModule({
  declarations: [...DECLARED, NotificationTypeToAlertTypePipe],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule
  ],
  exports: [...DECLARED]
})
export class SystemNotificationsModule { }
