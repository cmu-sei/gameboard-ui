import { SponsorService } from '@/api/sponsor.service';
import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sponsorLogoToLogoUri' })
export class SponsorLogoToLogoUriPipe implements PipeTransform {

  constructor(
    private configService: ConfigService,
    private sponsorService: SponsorService) { }

  transform(value: string): string {
    return !!value ?
      `${this.configService.imagehost}/${value}` :
      this.sponsorService.getDefaultLogoUri();
  }
}
