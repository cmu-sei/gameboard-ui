import { Component, OnInit } from '@angular/core';
import { SponsorService } from '@/api/sponsor.service';
import { Observable } from 'rxjs';
import { Sponsor } from '@/api/sponsor-models';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';

@Component({
  selector: 'app-parameter-sponsor',
  templateUrl: './parameter-sponsor.component.html',
  styleUrls: ['./parameter-sponsor.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterSponsorComponent)]
})
export class ParameterSponsorComponent extends CustomInputComponent<string> {
  sponsors$: Observable<Sponsor[]>;

  constructor(private sponsorService: SponsorService) {
    super();
    this.sponsors$ = sponsorService.list();
  }
}
