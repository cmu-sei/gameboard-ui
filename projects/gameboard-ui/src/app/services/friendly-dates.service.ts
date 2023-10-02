import { LocaleService } from '@/utility/services/locale.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FriendlyDatesService {
  constructor(private localeService: LocaleService) { }

  toFriendlyDate(date?: Date) {
    const transformed = this.transformDateInput(date);
    if (!transformed) {
      return "";
    }

    return transformed.toLocaleDateString();
  }

  toFriendlyTime(date?: Date) {
    const transformed = this.transformDateInput(date);
    if (!transformed)
      return "";

    return transformed.toLocaleTimeString(this.localeService.getLocale(), {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  toFriendlyDateAndTime(date?: Date): string {
    return `${this.toFriendlyDate(date)} @ ${this.toFriendlyTime(date)}`;
  }

  private transformDateInput(input?: Date): Date | null {
    if (!input)
      return null;

    return new Date(input);
  }
}
