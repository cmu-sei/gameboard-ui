import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'challengeBonusesToTooltip' })
export class ChallengeBonusesToTooltip implements PipeTransform {

  transform(value: { description: string }[]): string {
    if (!value || !value.length)
      return "";

    return value[0].description;
  }
}
