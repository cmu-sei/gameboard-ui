import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'manualBonusesToTooltip' })
export class ManualBonusesToTooltipPipe implements PipeTransform {

  transform(value: { description: string }[]): string {
    if (!value || !value.length)
      return "";

    return value[0].description;
  }
}
