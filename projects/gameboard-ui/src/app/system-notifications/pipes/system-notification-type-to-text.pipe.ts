import { SystemNotificationType } from '@/system-notifications/system-notifications.models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'systemNotificationTypeToText' })
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
