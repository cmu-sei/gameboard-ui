import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluralizer' })
export class PluralizerPipe implements PipeTransform {

  transform(label: string, count: any, addE: boolean = false): string {
    if (!label)
      return "";

    if (typeof count == "number" && count !== 1)
      return `${label}${(addE ? "e" : "")}s`;

    return label;
  }
}
