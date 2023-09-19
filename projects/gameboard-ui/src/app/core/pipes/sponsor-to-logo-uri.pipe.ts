import { Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorToLogoUri' })
export class SponsorToLogoUriPipe implements PipeTransform {
  constructor(
    private configService: ConfigService,
    private sponsorService: SponsorService) { }

  transform(value: Sponsor | null | undefined): string {
    return !!value?.logo ?
      `${this.configService.imagehost}/${value.logo}` :
      this.sponsorService.getDefaultLogoUri();
  }
}
