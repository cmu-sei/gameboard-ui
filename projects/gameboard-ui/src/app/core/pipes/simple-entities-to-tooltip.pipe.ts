import { SimpleEntity } from '@/api/models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'simpleEntitiesToTooltip',
    standalone: false
})
export class SimpleEntitiesToTooltipPipe implements PipeTransform {

  transform(value: SimpleEntity[] | null | undefined): string {
    if (!value || value.length == 0)
      return "";

    return value.map(e => e.name).join(" | ");
  }
}
