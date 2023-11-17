import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminPlayerStatus } from '../components/external-game-admin/external-game-admin.component';

@Pipe({ name: 'externalGamePlayerStatusToFriendly' })
export class ExternalGamePlayerStatusToFriendlyPipe implements PipeTransform {

  transform(value: ExternalGameAdminPlayerStatus): string {
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
