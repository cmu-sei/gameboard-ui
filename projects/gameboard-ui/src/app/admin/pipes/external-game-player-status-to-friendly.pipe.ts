// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { SyncStartPlayerStatus } from '../components/external-game-admin/external-game-admin.component';

@Pipe({
    name: 'externalGamePlayerStatusToFriendly',
    standalone: false
})
export class ExternalGamePlayerStatusToFriendlyPipe implements PipeTransform {

  transform(value: SyncStartPlayerStatus): string {
    switch (value) {
      case "notReady":
        return "Not ready";
      case "ready":
        return "Ready";
      default:
        return "Not connected";
    }
  }
}
