import { FontAwesomeService } from '@/services/font-awesome.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ColoredTextChipEvent {
  id?: any;
  text: string;
}

@Component({
  selector: 'app-colored-text-chip',
  templateUrl: './colored-text-chip.component.html',
  styleUrls: ['./colored-text-chip.component.scss']
})
export class ColoredTextChipComponent {
  @Input() text = '';
  @Input() id?: any;
  @Input() isClickable = false;
  @Input() enableSecondaryAction = false;
  @Input() secondaryActionIcon: IconDefinition = this.faService.times;
  @Input() size: "small" | "medium" | "large" = "medium";
  @Output() click = new EventEmitter<ColoredTextChipEvent>();
  @Output() secondaryActionClick = new EventEmitter<ColoredTextChipEvent>();

  constructor(public faService: FontAwesomeService) { }

  handleClick(text: string, id?: any) {
    this.click.emit({ id, text });
  }

  handleSecondaryActionClick(text: string, id?: any) {
    if (this.enableSecondaryAction)
      this.secondaryActionClick.emit({ id, text });
  }
}
