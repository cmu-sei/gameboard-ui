import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({ name: 'friendlyTime' })
export class FriendlyTimePipe implements PipeTransform {

  constructor(private localeService: LocaleService) { }

  transform(value?: Date): string {
    if (!value) {
      return "";
    }

    let dateValue = value;
    if (typeof dateValue === "string") {
      dateValue = new Date(Date.parse(dateValue));
    }

    return dateValue.toLocaleTimeString(this.localeService.getLocale(), {
      hour: "numeric",
      minute: "2-digit"
    });
  }
}
