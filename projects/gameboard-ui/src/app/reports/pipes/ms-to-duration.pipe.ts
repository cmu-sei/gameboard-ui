import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'msToDuration'
})
export class MsToDurationPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
