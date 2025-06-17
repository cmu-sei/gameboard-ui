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
