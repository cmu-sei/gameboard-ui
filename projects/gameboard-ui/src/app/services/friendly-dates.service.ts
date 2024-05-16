import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { LocaleService } from '@/utility/services/locale.service';

@Injectable({ providedIn: 'root' })
export class FriendlyDatesService {
  constructor(private localeService: LocaleService) { }

  toFriendlyDate(date?: string | Date | DateTime) {
    const transformed = this.transformDateInput(date);
    if (!transformed) {
      return "";
    }

    return transformed.toLocaleDateString(this.localeService.getLocale(), {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit"
    });
  }

  toFriendlyTime(date?: string | Date | DateTime) {
    const transformed = this.transformDateInput(date);
    if (!transformed)
      return "";

    return transformed.toLocaleTimeString(this.localeService.getLocale(), {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  toFriendlyDateAndTime(date?: string | Date | DateTime): string {
    return `${this.toFriendlyDate(date)} @ ${this.toFriendlyTime(date)}`;
  }

  private transformDateInput(input?: string | Date | DateTime): Date | null {
    if (!input)
      return null;

    if (typeof input == 'string' || input instanceof String)
      return DateTime.fromISO(input.toString()).toJSDate();

    if ("toJSDate" in input)
      return (input as DateTime).toJSDate();

    return new Date(input);
  }
}
