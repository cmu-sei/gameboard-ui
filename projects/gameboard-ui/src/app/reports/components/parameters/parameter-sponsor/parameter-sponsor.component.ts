import { Component, OnInit } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { SponsorService } from '@/api/sponsor.service';
import { Observable } from 'rxjs';
import { Sponsor } from '@/api/sponsor-models';

@Component({
  selector: 'app-parameter-sponsor',
  templateUrl: './parameter-sponsor.component.html',
  styleUrls: ['./parameter-sponsor.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterSponsorComponent)]
})
export class ParameterSponsorComponent extends ReportParameterComponent<string> {
  sponsors$: Observable<Sponsor[]>;

  constructor(private sponsorService: SponsorService) {
    super();
    this.sponsors$ = sponsorService.list();
  }
}
