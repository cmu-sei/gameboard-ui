import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'countToTooltipClass',
    standalone: false
})
export class CountToTooltipClassPipe implements PipeTransform {

  transform(value?: number): string | null {
    if (value) {
      return "tooltipped-value";
    }

    return null;
  }
}
