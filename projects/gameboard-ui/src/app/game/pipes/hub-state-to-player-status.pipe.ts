// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { HubState } from '../../services/notification.service';
import { PlayerStatus } from '../../core/components/player-status/player-status.component';

@Pipe({
    name: 'hubStateToPlayerStatus',
    standalone: false
})
export class HubStateToPlayerStatusPipe implements PipeTransform {

  transform(value: HubState): unknown {
    return value.connectionState ? PlayerStatus.Online : PlayerStatus.Offline;
  }
}
