import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayToCount',
    standalone: false
})
export class ArrayToCountPipe implements PipeTransform {

  transform(value: any[]): number {
    return value?.length || 0;
  }
}
