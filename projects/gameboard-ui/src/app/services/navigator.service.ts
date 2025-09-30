// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Inject, Injectable, InjectionToken } from '@angular/core';

export const NAVIGATOR = new InjectionToken("navigator");

@Injectable({ providedIn: 'root' })
export class NavigatorService {
  constructor(@Inject(NAVIGATOR) private navigator: Navigator) { }

  getNavigator() {
    return this.navigator;
  }
}
