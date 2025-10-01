// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { SyncStartPlayerStatus } from '../components/external-game-admin/external-game-admin.component';

@Pipe({
    name: 'syncStartTeamPlayerReadyCount',
    standalone: false
})
export class SyncStartTeamPlayerReadyCountPipe implements PipeTransform {

  transform(value: { status: SyncStartPlayerStatus }[]): string {
    if (!value?.length)
      return "";

    return `${value.filter(p => p.status == "ready").length}/${value.length}`;
  }
}
