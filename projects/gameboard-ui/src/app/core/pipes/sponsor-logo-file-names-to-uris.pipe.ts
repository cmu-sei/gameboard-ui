import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorLogoFileNamesToUris' })
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
