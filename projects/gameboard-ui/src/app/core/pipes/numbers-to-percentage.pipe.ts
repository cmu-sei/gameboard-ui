import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numbersToPercentage' })
export class NumbersToPercentage implements PipeTransform {

  transform(count: number, total: number): number {
    if (total <= 0)
      return 0;

    const rawPct = (count * 1.0) / total; // forces decimal division;
    const roundedToOne = (rawPct * 10) / 10.0;
    const mathed = roundedToOne * 100;
    return mathed;
  }
}
