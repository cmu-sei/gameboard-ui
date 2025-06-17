import { EventHorizonEventType } from '@/api/event-horizon.models';
import { EventHorizonRenderingService } from '@/services/event-horizon-rendering.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'eventTypeToFriendlyName',
    standalone: false
})
export class EventTypeToFriendlyNamePipe implements PipeTransform {
  constructor(private eventHorizonRenderingService: EventHorizonRenderingService) { }

  transform(value: EventHorizonEventType | null): string {
    if (!value)
      return "";

    return this.eventHorizonRenderingService.toFriendlyName(value);
  }
}
