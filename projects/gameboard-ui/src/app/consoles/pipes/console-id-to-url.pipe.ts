import { ConsoleId } from '@/api/consoles.models';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { RouterService } from '@/services/router.service';

@Pipe({ name: 'consoleIdToUrl' })
export class ConsoleIdToUrlPipe implements PipeTransform {
  private routerService = inject(RouterService);

  transform(value: ConsoleId): string {
    return this.routerService.buildVmConsoleUrl(value.challengeId, value.name).toString();
  }
}
