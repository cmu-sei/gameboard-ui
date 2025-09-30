// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { NavigatorService } from '@/services/navigator.service';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  constructor(private navigatorService: NavigatorService) { }

  getLocale(): string {
    return this.navigatorService.getNavigator().language;
  }
}
