import { NowService } from '@/services/now.service';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'isLive',
  standalone: true
})
export class IsLivePipe implements PipeTransform {
  private nowService = inject(NowService);

  transform(value: { gameStart?: DateTime, gameEnd?: DateTime }): boolean {
    const now = this.nowService.nowToDateTime();
    return (!value.gameStart || value.gameStart <= now) && (!value.gameEnd || value.gameEnd > now);
  }
}
