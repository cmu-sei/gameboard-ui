import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-whats-this',
  styles: [
    ".whats-this-container { display: inline }",
    ".has-tooltip { cursor: help }"
  ],
  template: `<div class="whats-this-container" [class.has-tooltip]="!!whatItIs" [popover]="whatItIs" [placement]="placement">
    <ng-content></ng-content>
  </div>`,
})
export class WhatsThisComponent {
  @Input() placement: "top" | "bottom" | "left" | "right" = "top";
  @Input() whatItIs = "";
}
