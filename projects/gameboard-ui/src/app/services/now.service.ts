// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
