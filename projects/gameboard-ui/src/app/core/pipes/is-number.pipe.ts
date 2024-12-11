import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isNumber', standalone: true })
export class IsNumberPipe implements PipeTransform {

  transform(value: any): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    const tryIt = +value;
    return isNaN(tryIt) ? false : true;
  }
}
