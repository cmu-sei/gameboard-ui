import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorsToLogoUris' })
export class SponsorsToLogoUrisPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: { logo: string }[]): string[] {
    if (!value?.length) {
      return [];
    }

    return value.map(sponsor => this.sponsorService.resolveAbsoluteSponsorLogoUri(sponsor.logo));
  }
}
