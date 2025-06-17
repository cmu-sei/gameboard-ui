import { Component, Input } from '@angular/core';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
    selector: 'app-toggle-switch',
    templateUrl: './toggle-switch.component.html',
    styleUrls: ['./toggle-switch.component.scss'],
    standalone: false
})
export class ToggleSwitchComponent extends CustomInputComponent<boolean> {
  @Input() label?: string;
}
