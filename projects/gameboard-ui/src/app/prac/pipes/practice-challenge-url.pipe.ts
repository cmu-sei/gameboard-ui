// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Pipe, PipeTransform } from '@angular/core';
import { RouterService } from '@/services/router.service';

@Pipe({ name: 'practiceChallengeUrl' })
export class PracticeChallengeUrlPipe implements PipeTransform {
  private readonly routerService = inject(RouterService);
  transform(challenge: { id: string; name?: string }): string {
    return this.routerService.getPracticeChallengeUrl(challenge);
  }
}
