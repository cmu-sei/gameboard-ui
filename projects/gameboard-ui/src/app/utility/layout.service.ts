import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  public stickyMenu$ = new BehaviorSubject<boolean>(true);
}
