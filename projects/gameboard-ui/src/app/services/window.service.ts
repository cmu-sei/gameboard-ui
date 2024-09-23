import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowService {
  constructor(@Inject(DOCUMENT) private document: Document) { }

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
