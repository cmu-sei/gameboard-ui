import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'msToDuration' })
export class MsToDurationPipe implements PipeTransform {
  transform(value?: number): string {
    if (!value)
      return "";

    const MS_IN_HOUR = 3600000;
    const MS_IN_MINUTE = 60000;
    const MS_IN_SECOND = 1000;

    const hours = Math.floor(value / MS_IN_HOUR);
    let remaining = value % MS_IN_HOUR;

    const minutes = Math.floor(remaining / MS_IN_MINUTE);
    remaining = remaining % MS_IN_MINUTE;

    const seconds = Math.floor(remaining / MS_IN_SECOND);
    remaining = Math.floor(remaining % MS_IN_SECOND);

    let retVals: string[] = [];

    if (hours)
      retVals.push(`${hours}h`);

    if (minutes)
      retVals.push(`${minutes}m`);

    // represent ms as a decimal value of seconds (e.g. "11.352s")
    if (seconds)
      retVals.push(`${seconds}${remaining ? `.${remaining}` : ""}s`);

    // if (remaining)
    //   retVals.push(`${remaining}ms`);

    return retVals.join(":");
  }
}
