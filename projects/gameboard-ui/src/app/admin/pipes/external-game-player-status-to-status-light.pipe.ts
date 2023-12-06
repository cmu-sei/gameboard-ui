import { StatusLightState } from '@/core/components/status-light/status-light.component';
import { Pipe, PipeTransform } from '@angular/core';
import { ExternalGameAdminPlayerStatus } from '../components/external-game-admin/external-game-admin.component';

@Pipe({ name: 'externalGamePlayerStatusToStatusLight' })
export class ExternalGamePlayerStatusToStatusLightPipe implements PipeTransform {

  transform(value: ExternalGameAdminPlayerStatus): StatusLightState {
    if (value === "ready")
      return "active";
    if (value === "notReady")
      return "preparing";

    return "error";
  }
}
