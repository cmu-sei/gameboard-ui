import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {

  transform(value: any[], compareProperty: string, descending = false): any[] {
    if (!value || !value.length) {
      return value;
    }

    const copied = [...value];
    copied.sort((a, b) => {
      const valueA = a[compareProperty];
      const valueB = b[compareProperty];

      let compareResult = 0;
      if (a < b)
        return -1;
      else if (a > b)
        return 1;

      return compareResult * (descending ? -1 : 1);
    });

    return copied;
  }
}
