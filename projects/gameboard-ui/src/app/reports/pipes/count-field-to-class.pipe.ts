import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countFieldToClass'
})
export class CountFieldToClassPipe implements PipeTransform {

  transform(value: any[]): string | null {
    if (value?.length) {
      return "tooltipped-value";
    }

    return null;
  }
}
