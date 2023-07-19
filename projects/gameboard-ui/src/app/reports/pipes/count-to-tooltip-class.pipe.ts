import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'countToTooltipClass' })
export class CountToTooltipClassPipe implements PipeTransform {

  transform(value?: number): string | null {
    if (value) {
      return "tooltipped-value";
    }

    return null;
  }
}
