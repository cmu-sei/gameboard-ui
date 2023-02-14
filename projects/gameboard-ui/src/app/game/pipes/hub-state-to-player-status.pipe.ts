import { Pipe, PipeTransform } from '@angular/core';
import { HubState } from '../../utility/notification.service';
import { PlayerStatus } from '../player-status/player-status.component';

@Pipe({ name: 'hubStateToPlayerStatus' })
export class HubStateToPlayerStatusPipe implements PipeTransform {

  transform(value: HubState): unknown {
    return value.connected ? PlayerStatus.Online : PlayerStatus.Offline;
  }

}
