import { Pipe, PipeTransform } from '@angular/core';
import { HubState } from '../../services/notification.service';
import { PlayerStatus } from '../../core/components/player-status/player-status.component';

@Pipe({ name: 'hubStateToPlayerStatus' })
export class HubStateToPlayerStatusPipe implements PipeTransform {

  transform(value: HubState): unknown {
    return value.connectionState ? PlayerStatus.Online : PlayerStatus.Offline;
  }

}
