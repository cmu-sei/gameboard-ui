import { SponsorWithChildSponsors } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-parameter-sponsor',
  templateUrl: './parameter-sponsor.component.html',
  styleUrls: ['./parameter-sponsor.component.scss']
})
export class ParameterSponsorComponent {
  protected parentSponsors$: Observable<SponsorWithChildSponsors[]>;

  constructor(private sponsorService: SponsorService) {
    this.parentSponsors$ = this.sponsorService.listWithChildren();
  }
}
