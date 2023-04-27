import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-report-parameters-container',
  templateUrl: './report-parameters-container.component.html',
  styleUrls: ['./report-parameters-container.component.scss']
})
export class ReportParametersContainerComponent {
  @Input() onRunRequest?: () => void;
  @Input() onSelectionsCleared?: () => void;

  handleClearSelections() {
    if (this.onSelectionsCleared)
      this.onSelectionsCleared();
  }

  handleRunClick() {
    if (this.onRunRequest)
      this.onRunRequest();
  }
}
