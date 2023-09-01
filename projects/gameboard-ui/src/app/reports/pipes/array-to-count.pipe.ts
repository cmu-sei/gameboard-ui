import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arrayToCount' })
export class ArrayToCountPipe implements PipeTransform {

  transform(value: any[]): number {
    return value?.length || 0;
  }
}
