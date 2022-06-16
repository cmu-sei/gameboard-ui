import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'shorttime'})
export class ShortTimePipe implements PipeTransform {

  transform(date: any, timeZone: boolean = false): string {
    const t = new Date(date);
    let options = { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric'} as any
    if (timeZone)
      options.timeZoneName = 'shortGeneric';
    return t.toLocaleTimeString("en-US", options);
}

}
