import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../config.service';

@Pipe({ name: 'shorttime' })
export class ShortTimePipe implements PipeTransform {
  constructor(private config: ConfigService) { }

  transform(date: any, timeZone = false, includeSeconds = false): string {
    const style = timeZone
      ? (includeSeconds ? this.config._shorttz_formatter_with_seconds : this.config.shorttz_formatter)
      : (includeSeconds ? this.config._shortdate_formatter_with_seconds : this.config.shortdate_formatter)
      ;
    return style.format(new Date(date));
  }
}
