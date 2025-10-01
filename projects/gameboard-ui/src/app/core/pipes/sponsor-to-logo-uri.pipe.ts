// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sponsorToLogoUri',
    standalone: false
})
export class SponsorToLogoUriPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: { logo: string } | null | undefined): string {
    return this.sponsorService.resolveAbsoluteSponsorLogoUri(value?.logo);
  }
}
