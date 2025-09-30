// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { RouterService } from '@/services/router.service';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { UrlTree } from '@angular/router';

@Pipe({
  name: 'gameToGameCenterLink',
  standalone: true
})
export class GameToGameCenterLinkPipe implements PipeTransform {
  private routerService = inject(RouterService);

  transform(value: string): UrlTree | undefined {
    if (!value) {
      return undefined;
    }

    return this.routerService.getGameCenterUrl(value);
  }
}
