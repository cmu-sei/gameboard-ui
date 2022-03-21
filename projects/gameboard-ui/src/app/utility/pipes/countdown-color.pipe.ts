import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countdowncolor'
})
export class CountdownColorPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    if (value >= (1000 * 60 * 60)) { // >= 1 hour
      return "countdown-green";
    } else if (value >= (1000 * 60 * 5)) { // < 1 hour and >= 5 min
      return "countdown-yellow";
    } else if (value != 0) {  // < 5 min and not 0 (game over)
      return "countdown-red";
    }
    return "";
  }

}
