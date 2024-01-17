import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'eventTypeSelectionToBoolean' })
export class EventTypeSelectionToBooleanPipe implements PipeTransform {
  transform(key: string, selections: { [key: string]: boolean }): boolean {
    if (Object.keys(selections).some(k => k === key))
      return selections[key];

    return false;
  }
}
