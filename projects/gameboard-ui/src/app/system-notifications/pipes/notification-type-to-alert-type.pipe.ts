import { Pipe, PipeTransform } from '@angular/core';
import { SystemNotificationType } from '../system-notifications.models';

@Pipe({ name: 'notificationTypeToAlertType' })
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
