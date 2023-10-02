import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnsubscriberService implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  add(sub: Subscription) {
    this._subscriptions.push(sub);
  }

  unsubscribeAll() {
    for (const sub of this._subscriptions) {
      sub?.unsubscribe();
    }

    this._subscriptions = [];
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }
}
