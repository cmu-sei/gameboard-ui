import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { UnsubscriberService } from './unsubscriber.service';

@Injectable({
  providedIn: 'root',
})
export class WindowService implements OnDestroy {
  private _resizeBehaviorSubject$ = new BehaviorSubject<number>(this.document.defaultView?.innerWidth || 0);
  public resize$ = this._resizeBehaviorSubject$.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private unsub: UnsubscriberService) {
    unsub.add(fromEvent(this.get(), 'resize').subscribe(ev => {
      console.log("ev is", ev);
      this._resizeBehaviorSubject$.next(this.get().innerWidth);
    }));
  }

  ngOnDestroy(): void {
    this.unsub.unsubscribeAll();
  }

  get(): Window {
    return this.document.defaultView!;
  }

  open() {
    this.document.defaultView?.open(undefined, "_blank");
  }

  print() {
    this.document.defaultView!.print();
  }

  remToPx(rem: string): number {
    const remVal = parseInt(rem.replace("rem", ""));
    return parseInt(getComputedStyle(document.documentElement).fontSize.replace("px", "")) * remVal;
  }

  scrollToBottom() {
    this.document.defaultView?.scrollTo(0, this.document.body.scrollHeight);
  }
}
