import { Component, Input } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';

@Component({
  selector: 'app-parameter-number',
  templateUrl: './parameter-number.component.html',
  styleUrls: ['./parameter-number.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterNumberComponent)]
})
export class ParameterNumberComponent extends ReportParameterComponent {
  @Input() label?: string;
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() name!: string;
  @Input() placeholder?: string;
}
