import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'textcolor' })
export class TextToColorPipe implements PipeTransform {

  transform(value: string): any {
    // inspired by StackOverflow
    // todo: map to different hue range if desired
    var hash = 0;
    for (var i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    var hex = '#';
    let rgb = [0, 0, 0]
    for (var i = 0; i < 3; i++) {
      var val = (hash >> (i * 8)) & 0xFF;
      rgb[i] = val;
      hex += ('00' + val.toString(16)).slice(-2);
    }

    // calculate brightness of background color rgb
    let brightness = Math.sqrt(
      0.299 * (rgb[0] * rgb[0]) +
      0.587 * (rgb[1] * rgb[1]) +
      0.114 * (rgb[2] * rgb[2])
    );

    let color = brightness > 120 ? 'black' : 'white';
    return { 'background-color': hex, 'color': color };
  }

}
