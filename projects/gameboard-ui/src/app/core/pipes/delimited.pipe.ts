import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'delimited',
    standalone: false
})
export class DelimitedPipe implements PipeTransform {

  transform(value: string, delimiter = ","): string[] {
    if (!value)
      return [];

    return value.split(delimiter).map(item => item.trim());
  }
}
