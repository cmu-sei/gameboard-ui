import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'arrayContains',
    standalone: false
})
export class ArrayContainsPipe implements PipeTransform {
  transform<T>(value: T, array: T[], invert = false): boolean {
    const result = array.some(i => i === value);

    return invert ? !result : result;
  }
}
