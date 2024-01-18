import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arrayContains' })
export class ArrayContainsPipe implements PipeTransform {
  transform<T>(value: T, array: T[]): boolean {
    return array.some(i => i === value);
  }
}
