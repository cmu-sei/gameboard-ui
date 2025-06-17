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
