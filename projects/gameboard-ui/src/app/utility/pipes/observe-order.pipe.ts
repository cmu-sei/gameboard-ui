import { Pipe, PipeTransform } from '@angular/core';
import { ObserveChallenge } from '../../api/board-models';

@Pipe({
    name: 'observeorder',
    standalone: false
})
export class ObserveOrderPipe implements PipeTransform {

  transform(rank: number, pinned: boolean, sort: string, maxRank: number, ...args: unknown[]): any {
    if (sort == "byRank") {
      if (pinned) return rank - (maxRank * 2); // negative but still in order
      return rank + 1; // positive and in order
    } else if (pinned) {
      return -1; // ties at -1 will be at top but maintain other sorted order
    }
    return 0; // all others will default to 0, maintaining DOM order when tied
  }

}
