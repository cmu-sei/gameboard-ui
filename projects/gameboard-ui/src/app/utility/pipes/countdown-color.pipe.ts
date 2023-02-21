import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '.././config.service';

@Pipe({ name: 'countdowncolor' })
export class CountdownColorPipe implements PipeTransform {
  startSecondsAtMinute: number = 5; // default to 5 minutes

  constructor(
    private config?: ConfigService
  ) {
    if ((config?.settings.countdownStartSecondsAtMinute ?? 0) > 0) // lowest allowed setting is 1 min
      this.startSecondsAtMinute = config?.settings.countdownStartSecondsAtMinute!;
  }

  transform(value: number | undefined, ...args: unknown[]): string {
    if (value) {
      if (value >= (1000 * 60 * 60)) { // >= 1 hour
        return "countdown-green";
      } else if (value >= (1000 * 60 * this.startSecondsAtMinute)) { // < 1 hour and >= <threshold> min
        return "countdown-yellow";
      } else if (value != 0) {  // < <threshold> min and not 0 (game over)
        return "countdown-red";
      }
    }

    return "";
  }

}
