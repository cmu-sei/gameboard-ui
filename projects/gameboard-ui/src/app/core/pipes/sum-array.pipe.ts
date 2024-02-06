import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sumArray' })
export class SumArrayPipe implements PipeTransform {

  transform(value: number[]): number {
    if (!value?.length)
      return 0;

    return value.reduce((accumulator, nextValue) => {
      return accumulator + nextValue;
    });
  }
}
