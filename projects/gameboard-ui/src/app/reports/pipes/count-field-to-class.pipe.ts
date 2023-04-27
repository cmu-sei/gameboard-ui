import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countFieldToClass'
})
export class CountFieldToClassPipe implements PipeTransform {

  transform(value: string[]): string | null {
    if (value?.length) {
      return "tooltipped-value";
    }

    return null;
  }
}
