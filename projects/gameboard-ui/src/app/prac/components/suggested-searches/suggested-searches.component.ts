import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-suggested-searches',
  templateUrl: './suggested-searches.component.html',
  styleUrls: ['./suggested-searches.component.scss']
})
export class SuggestedSearchesComponent {
  @Input() searches: string[] = [];
}
