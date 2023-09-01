import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  public stickyMenu$ = new BehaviorSubject<boolean>(true);

  constructor(@Inject(DOCUMENT) private document: Document) { }

  public getNavHeight(): number | undefined {
    const nav = this.document.getElementsByTagName("nav");

    if (nav.length != 1) {
      throw Error(`Couldn't resolve the nav bar for height calculation: ${JSON.stringify(nav)}`);
    }

    return nav.item(0)?.clientHeight;
  }
}
