import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    standalone: false
})
export class GbProgressBarComponent {
  @Input() percentage: number = 0;
  @Input() total = 0;
  @Input() complete = 0;
  @Input() ratioLabel = "";
}
