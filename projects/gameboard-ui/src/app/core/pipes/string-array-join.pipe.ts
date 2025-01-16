import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringArrayJoin',
  standalone: true
})
export class StringArrayJoinPipe implements PipeTransform {

  transform(value: string[], delimiter: string = ", "): string {
    if (!value) {
      return "";
    }

    return value.join(delimiter);
  }
}
