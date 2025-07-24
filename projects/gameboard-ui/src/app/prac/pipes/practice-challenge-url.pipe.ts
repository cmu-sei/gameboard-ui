import { inject, Pipe, PipeTransform } from '@angular/core';
import { RouterService } from '@/services/router.service';

@Pipe({ name: 'practiceChallengeUrl' })
export class PracticeChallengeUrlPipe implements PipeTransform {
  private readonly routerService = inject(RouterService);
  transform(challenge: { id: string; name?: string }): string {
    return this.routerService.getPracticeChallengeUrl(challenge);
  }
}
