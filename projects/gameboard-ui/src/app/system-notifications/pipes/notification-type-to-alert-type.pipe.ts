// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { SystemNotificationType } from '../system-notifications.models';

@Pipe({
    name: 'notificationTypeToAlertType',
    standalone: false
})
export class NotificationTypeToAlertTypePipe implements PipeTransform {

  transform(value: SystemNotificationType): string {
    switch (value) {
      case "emergency":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  }

}
