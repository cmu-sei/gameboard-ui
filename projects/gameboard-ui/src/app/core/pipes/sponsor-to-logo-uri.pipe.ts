import { SponsorService } from '@/api/sponsor.service';
import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorToLogoUri' })
export class SponsorToLogoUriPipe implements PipeTransform {
  constructor(
    private configService: ConfigService,
    private sponsorService: SponsorService) { }

  transform(value: { logo: string } | null | undefined): string {
    return this.sponsorService.resolveAbsoluteSponsorLogoUri(value?.logo);
  }
}
