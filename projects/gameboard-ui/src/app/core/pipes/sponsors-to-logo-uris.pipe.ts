// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sponsorsToLogoUris',
    standalone: false
})
export class SponsorsToLogoUrisPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: { logo: string }[]): string[] {
    if (!value?.length) {
      return [];
    }

    return value.map(sponsor => this.sponsorService.resolveAbsoluteSponsorLogoUri(sponsor.logo));
  }
}
