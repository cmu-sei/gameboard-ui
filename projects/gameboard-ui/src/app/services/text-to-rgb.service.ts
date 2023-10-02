import { Injectable } from '@angular/core';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

@Injectable({ providedIn: 'root' })
export class TextToRgbService {

  public get(text: string): RGB {
    // inspired by StackOverflow
    // todo: map to different hue range if desired
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return {
      r: this.hashToRgbValue(hash, 0),
      g: this.hashToRgbValue(hash, 1),
      b: this.hashToRgbValue(hash, 2)
    };
  }

  private hashToRgbValue(hash: number, index: number) {
    return (hash >> (index * 8)) & 0xFF;
  }

  public getAsRgbString(text: string): string {
    const output = this.get(text);
    return `rgb(${output.r}, ${output.g}, ${output.b})`;
  }

  public rgbToHex(rgb: RGB) {
    return `#${this.rgbComponentToHex(rgb.r)}${this.rgbComponentToHex(rgb.g)}${this.rgbComponentToHex(rgb.b)}`;
  }

  private rgbComponentToHex(n: number) {
    const hex = n.toString(16);
    return hex.padStart(2, "0");
  }
}
