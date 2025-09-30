// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SystemNotificationType } from '@/system-notifications/system-notifications.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'systemNotificationTypeToText',
    standalone: false
})
export class SystemNotificationTypeToTextPipe implements PipeTransform {

  transform(value: SystemNotificationType): string {
    switch (value) {
      case "warning":
        return "Warning";
      case "emergency":
        return "Emergency";
      default:
        return "General Info";
    }
  }
}
