import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'absoluteValue',
    standalone: false
})
export class AbsoluteValuePipe implements PipeTransform {
  transform(value: number): number {
    return Math.abs(value);
  }
}
