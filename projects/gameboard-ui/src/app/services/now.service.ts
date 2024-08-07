import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class NowService {
  now(): Date {
    return new Date();
  }

  nowToDateTime(): DateTime {
    return DateTime.now();
  }

  nowToMsEpoch(): number {
    return DateTime.now().toUnixInteger() * 1000;
  }
}
