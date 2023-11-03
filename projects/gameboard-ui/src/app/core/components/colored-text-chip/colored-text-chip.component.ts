import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fa } from "@/services/font-awesome.service";

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
  @Input() secondaryActionIcon: IconDefinition = fa.times;
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() colorMode: "colored" | "monochrome" = "colored";
  @Output() click = new EventEmitter<ColoredTextChipEvent>();
  @Output() secondaryActionClick = new EventEmitter<ColoredTextChipEvent>();

  handleClick(textChipEvent: ColoredTextChipEvent, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.click.emit(textChipEvent);
  }

  handleSecondaryActionClick(text: string, id?: any) {
    if (this.enableSecondaryAction)
      this.secondaryActionClick.emit({ id, text });
  }
}
