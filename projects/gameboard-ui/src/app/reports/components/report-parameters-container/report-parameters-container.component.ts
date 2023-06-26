import { Component } from '@angular/core';

@Component({
  selector: 'app-report-parameters-container',
  template: `<div class="report-parameters-component">
    <hr />
    <div class="parameters-container d-flex flex-wrap input-group-lg full-width">
        <ng-content></ng-content>
    </div>
    <hr />
</div>

<ng-template #loading><app-spinner></app-spinner></ng-template>`,
  styleUrls: ['./report-parameters-container.component.scss']
})
export class ReportParametersContainerComponent {
}
