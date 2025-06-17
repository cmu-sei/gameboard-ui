import { Pipe, PipeTransform } from '@angular/core';
import { TextToRgbService } from '@/services/text-to-rgb.service';

@Pipe({
    name: 'textToBadgeStyle',
    standalone: false
})
export class TextToBadgeStylePipe implements PipeTransform {

  constructor(private textToRgb: TextToRgbService) { }

  transform(value: string): any {
    const rgb = this.textToRgb.get((value || "").toLowerCase());
    const hex = this.textToRgb.rgbToHex(rgb);

    // calculate brightness of background color rgb
    const brightness = Math.sqrt(
      0.299 * (rgb.r * rgb.r) +
      0.587 * (rgb.g * rgb.g) +
      0.114 * (rgb.b * rgb.b)
    );

    const color = brightness > 120 ? 'black' : 'white';
    return { 'background-color': hex, 'color': color };
  }
}
