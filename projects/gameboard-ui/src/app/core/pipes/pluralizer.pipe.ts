import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralizer'
})
export class PluralizerPipe implements PipeTransform {

  transform(value: string, count: number, addE: boolean = false): string {
    if (!value)
      return "";

    if (count !== 1)
      return `${value}${(addE ? "e" : "")}s`;

    return value;
  }
}
