import { Component, Input } from '@angular/core';

export type StatusLightState = "none" | "preparing" | "active" | "error";

@Component({
  selector: 'app-status-light',
  styleUrls: ['./status-light.component.scss'],
  template: `
    <div class="component-container d-flex justify-content-center align-items-center" [tooltip]="tooltip || ''">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36px" height="36px">
        <circle
          [class.state-none]="state == 'none'"
          [class.state-preparing]="state == 'preparing'"
          [class.state-active]="state == 'active'"
          [class.state-error]="state == 'error'"
          [attr.cx]="18" [attr.cy]="18" [attr.r]="11" />
      </svg>
    </div>`
})
export class StatusLightComponent {
  @Input() state: StatusLightState = "none";
  @Input() tooltip = "";
}
