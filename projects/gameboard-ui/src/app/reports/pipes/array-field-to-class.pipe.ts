import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arrayFieldToClass' })
export class ArrayFieldToClassPipe implements PipeTransform {

  transform(value: any[]): string | null {
    if (value?.length) {
      return "tooltipped-value";
    }

    return null;
  }
}
