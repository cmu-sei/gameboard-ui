// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ConfigService } from '@/utility/config.service';

@Component({
    selector: 'app-practice-page',
    templateUrl: './practice-page.component.html',
    styleUrls: ['./practice-page.component.scss'],
    standalone: false
})
export class PracticePageComponent {
  protected appName?: string;

  constructor(
    configService: ConfigService) {
    this.appName = configService.environment.settings.appname || "Gameboard";
  }
}
