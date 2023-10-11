import { PlayerWithAvatar } from '@/api/models';
import { SponsorService } from '@/api/sponsor.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'playerWithAvatarsToAvatarUrls' })
export class PlayerWithAvatarsToAvatarUrlsPipe implements PipeTransform {
    constructor(private sponsorService: SponsorService) { }

    transform(values: PlayerWithAvatar[]): string[] {
        if (!values?.length) {
            return [];
        }

        return values.map(p => this.sponsorService.resolveAbsoluteSponsorLogoUri(p.avatarFile));
    }
}
