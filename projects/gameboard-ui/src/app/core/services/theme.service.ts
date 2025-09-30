// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { environment } from 'projects/gameboard-ui/src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  getThemeBgClass() {
    return environment.settings.custom_background || "custom-bg-black";
  }
}
