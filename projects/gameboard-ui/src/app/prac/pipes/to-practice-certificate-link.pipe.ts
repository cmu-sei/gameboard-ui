import { inject, Pipe, PipeTransform } from '@angular/core';
import { RouterService } from '@/services/router.service';
import { PlayerMode } from '@/api/player-models';

@Pipe({
  name: 'toPracticeCertificateLink',
  standalone: true
})
export class ToPracticeCertificateLinkPipe implements PipeTransform {
  private routerService = inject(RouterService);

  transform(challengeSpecId: string): string {
    return this.routerService.getCertificatePrintableUrl(PlayerMode.practice, challengeSpecId);
  }
}
