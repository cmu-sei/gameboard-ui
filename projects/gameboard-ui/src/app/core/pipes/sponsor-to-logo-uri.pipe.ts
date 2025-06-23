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
