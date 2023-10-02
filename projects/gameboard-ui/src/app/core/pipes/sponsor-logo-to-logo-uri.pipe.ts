import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorLogoToLogoUri' })
export class SponsorLogoToLogoUriPipe implements PipeTransform {
  constructor(private sponsorService: SponsorService) { }

  transform(value: string): string {
    return this.sponsorService.resolveAbsoluteSponsorLogoUri(value);
  }
}
