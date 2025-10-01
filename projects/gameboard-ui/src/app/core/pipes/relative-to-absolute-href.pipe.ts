// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { buildUrl } from '@/../tools/functions';

@Pipe({
    name: 'relativeToAbsoluteHref',
    standalone: false
})
export class RelativeToAbsoluteHrefPipe implements PipeTransform {
  constructor(private configService: ConfigService) { }

  transform(value: string): string {
    if (!value)
      return value;

    return buildUrl(this.configService.absoluteUrl, value) || "";
  }
}
