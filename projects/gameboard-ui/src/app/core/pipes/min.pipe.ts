import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'min' })
export class MinPipe implements PipeTransform {

  transform(value: number, other: number): number {
    return Math.min(value, other);
  }
}
