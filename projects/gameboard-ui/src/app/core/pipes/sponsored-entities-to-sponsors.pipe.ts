// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sponsoredEntitiesToSponsors',
    standalone: false
})
export class SponsoredEntitiesToSponsorsPipe implements PipeTransform {

  transform(value: { sponsor: { logo: string } }[]): { logo: string }[] {
    if (!value)
      return [];

    return value.map(v => v.sponsor);
  }
}
