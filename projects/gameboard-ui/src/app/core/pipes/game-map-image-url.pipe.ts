// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ConfigService } from '@/utility/config.service';
import { DOCUMENT } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'gameMapImageUrl',
    standalone: false
})
export class GameMapImageUrlPipe implements PipeTransform {
  private document = inject(DOCUMENT);
  constructor(private config: ConfigService) { }

  transform(value?: string): string {
    if (!value) {
      return `${this.config.basehref}assets/map.png`;
    }

    const isAbsolute = new URL(this.document.baseURI).origin !== new URL(value, this.document.baseURI).origin;
    return isAbsolute ? value : `${this.config.imagehost}/${value}`;
  }
}
