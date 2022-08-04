import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../config.service';

@Pipe({name: 'shorttime'})
export class ShortTimePipe implements PipeTransform {

  constructor(private config: ConfigService) {}

  transform(date: any, timeZone: boolean = false): string {
    const style = timeZone
      ? this.config.shorttz_formatter
      : this.config.shortdate_formatter
    ;
    return style.format(new Date(date));
  }

}
