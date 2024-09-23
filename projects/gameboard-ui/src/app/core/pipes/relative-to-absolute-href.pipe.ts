import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { buildUrl } from '@/../tools/functions';

@Pipe({ name: 'relativeToAbsoluteHref' })
export class RelativeToAbsoluteHrefPipe implements PipeTransform {
  constructor(private configService: ConfigService) { }

  transform(value: string): string {
    if (!value)
      return value;

    return buildUrl(this.configService.absoluteUrl, value) || "";
  }
}
