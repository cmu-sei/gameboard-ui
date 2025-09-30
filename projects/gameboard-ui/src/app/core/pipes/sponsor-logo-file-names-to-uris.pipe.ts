// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sponsorLogoFileNamesToUris',
    standalone: false
})
export class SponsorLogoFileNamesToUrisPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: string | string[]): string[] {
    if (!value) {
      return [];
    }

    let valueArray: string[] = Array.isArray(value) ? value : [value];
    return valueArray.map(logoFileName => this.sponsorService.resolveAbsoluteSponsorLogoUri(logoFileName));
  }
}
