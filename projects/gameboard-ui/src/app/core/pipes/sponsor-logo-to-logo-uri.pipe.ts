// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorLogoToLogoUri' })
export class SponsorLogoToLogoUriPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: string): string {
    return this.sponsorService.resolveAbsoluteSponsorLogoUri(value);
  }
}
