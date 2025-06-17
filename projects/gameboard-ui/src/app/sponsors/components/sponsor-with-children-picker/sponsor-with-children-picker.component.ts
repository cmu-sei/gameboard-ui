import { Component, input, output } from '@angular/core';
import { Sponsor } from '@/api/sponsor-models';

@Component({
    selector: 'app-sponsor-with-children-picker',
    templateUrl: './sponsor-with-children-picker.component.html',
    styleUrls: ['./sponsor-with-children-picker.component.scss'],
    standalone: false
})
export class SponsorWithChildrenPickerComponent {
  childSponsors = input.required<Sponsor[]>();
  parentSponsor = input<Sponsor>();
  selectedSponsorId = input<string | null | undefined>();

  error = output<any>();
  selected = output<Sponsor>();

  protected handleSelected(sponsor: Sponsor) {
    this.selected.emit(sponsor);
  }
}
