import { ColoredTextChipEvent } from '@/core/components/colored-text-chip/colored-text-chip.component';
import { RouterService } from '@/services/router.service';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-suggested-searches',
  templateUrl: './suggested-searches.component.html',
  styleUrls: ['./suggested-searches.component.scss']
})
export class SuggestedSearchesComponent {
  @Input() searches: string[] = [];

  constructor(private routerService: RouterService) { }

  protected handleSearchClick(event: ColoredTextChipEvent) {
    this.routerService.toPracticeAreaWithSearch(event.text);
  }
}
