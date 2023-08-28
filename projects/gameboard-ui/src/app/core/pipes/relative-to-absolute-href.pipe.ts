import { buildUrl } from '@/tools/functions';
import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeToAbsoluteHref' })
export class RelativeToAbsoluteHrefPipe implements PipeTransform {
  constructor(private configService: ConfigService) { }

  transform(value: string): string {
    if (!value)
      return value;

    return buildUrl(this.configService.absoluteUrl, value) || "";
  }
}
