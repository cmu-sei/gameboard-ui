// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogService } from './log.service';

@Injectable()
export class UnsubscriberService implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  constructor(private logService: LogService) { }

  add(...subs: Subscription[]) {
    for (const sub of subs)
      this._subscriptions.push(sub);
  }

  unsubscribeAll() {
    for (const sub of this._subscriptions) {
      sub?.unsubscribe();
    }

    this._subscriptions = [];
  }

  ngOnDestroy(): void {
    if (this._subscriptions.length) {
      this.unsubscribeAll();
      this.logService.logInfo(`Unsubscriber tossed ${this._subscriptions.length} subs.`);
    }
  }
}
