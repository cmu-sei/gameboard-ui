import { TextToRgbService } from '@/services/text-to-rgb.service';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textToHexColor',
  standalone: true
})
export class TextToHexColorPipe implements PipeTransform {
  private textToRgb = inject(TextToRgbService);

  transform(value: string, getContrastColor?: boolean): string {
    const rgb = this.textToRgb.get((value || "").toLowerCase());

    if (!getContrastColor) {
      return this.textToRgb.rgbToHex(rgb);
    }

    return this.textToRgb.getBrightness(rgb) > 120 ? 'black' : 'white';
  }
}
