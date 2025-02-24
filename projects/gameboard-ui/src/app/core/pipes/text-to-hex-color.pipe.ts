import { TextToRgbService } from '@/services/text-to-rgb.service';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textToHexColor',
  standalone: true
})
export class TextToHexColorPipe implements PipeTransform {
  private textToRgb = inject(TextToRgbService);

  transform(value: string): unknown {
    const rgb = this.textToRgb.get((value || "").toLowerCase());
    return this.textToRgb.rgbToHex(rgb);
  }
}
