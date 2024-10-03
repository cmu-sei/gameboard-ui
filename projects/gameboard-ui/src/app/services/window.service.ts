import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WindowService implements OnDestroy {
  private _windowResizeSub?: Subscription;
  private _resizeBehaviorSubject$ = new BehaviorSubject<number>(this.document.defaultView?.innerWidth || 0);
  public resize$ = this._resizeBehaviorSubject$.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document) {
    this._windowResizeSub = fromEvent(this.get(), 'resize').subscribe(ev => {
      this._resizeBehaviorSubject$.next(this.get().innerWidth);
    });
  }

  ngOnDestroy(): void {
    this._windowResizeSub?.unsubscribe();
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
