// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSystemNotificationsComponent } from './components/admin-system-notifications/admin-system-notifications.component';
import { CreateEditSystemNotificationModalComponent } from './components/create-edit-system-notification-modal/create-edit-system-notification-modal.component';
import { SystemNotificationTypeToTextPipe } from './pipes/system-notification-type-to-text.pipe';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@/core/core.module';
import { SystemNotificationsComponent } from './components/system-notifications/system-notifications.component';
import { NotificationTypeToAlertTypePipe } from './pipes/notification-type-to-alert-type.pipe';
import { MarkdownPlaceholderPipe } from '@/core/pipes/markdown-placeholder.pipe';
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';

const DECLARED = [
  AdminSystemNotificationsComponent,
  CreateEditSystemNotificationModalComponent,
  NotificationTypeToAlertTypePipe,
  SystemNotificationTypeToTextPipe,
  SystemNotificationsComponent
];

@NgModule({
  declarations: [...DECLARED],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    // standalones
    MarkdownPlaceholderPipe,
    PluralizerPipe,
  ],
  exports: [...DECLARED]
})
export class SystemNotificationsModule { }
