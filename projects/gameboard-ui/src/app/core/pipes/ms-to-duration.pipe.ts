import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'msToDuration' })
export class MsToDurationPipe implements PipeTransform {
  transform(value?: number): string {
    console.log("gort a value", value);
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

    // by request, ignore ms and just round off here
    if (seconds)
      retVals.push(`${seconds}s`);

    return retVals.join(" ");
  }
}
