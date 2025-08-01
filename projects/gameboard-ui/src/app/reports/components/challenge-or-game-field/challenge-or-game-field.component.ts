import { ReportGame } from '@/reports/reports-models';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-challenge-or-game-field',
    templateUrl: './challenge-or-game-field.component.html',
    styleUrls: ['./challenge-or-game-field.component.scss'],
    standalone: false
})
export class ChallengeOrGameFieldComponent {
  @Input() challengeName?: string;
  @Input() game?: ReportGame;
  @Input() disableLinks = false;
  @Input() mainLabelClass = "";
  @Input() fontSize: "small" | "large" = "small";
}
