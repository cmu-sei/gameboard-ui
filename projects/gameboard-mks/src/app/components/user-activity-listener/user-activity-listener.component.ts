import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Subject, Subscription, throttleTime } from 'rxjs';

export type UserActivityListenerEventType = "input" | "mouse";

@Component({
  selector: 'app-user-activity-listener',
  template: ""
})
export class UserActivityListenerComponent {
  @Output() userAction = new EventEmitter<UserActivityListenerEventType>();

  private _actionStream$ = new Subject<UserActivityListenerEventType>();
  private _actionStreamSub: Subscription;

  constructor() {
    this._actionStreamSub = this._actionStream$
      .pipe(throttleTime(60000))
      .subscribe(ev => {
        /* eslint-disable no-console */
        console.info("User activity listener emitting", ev);
        this.userAction.emit(ev);
      });
  }

  ngOnDestroy(): void {
    this._actionStreamSub?.unsubscribe();
  }

  @HostListener("window:keydown", ["$event"])
  protected handleKeyDown(ev: KeyboardEvent) {
    this._actionStream$.next("input");
  }

  @HostListener("window:mouseover", ["$event"])
  @HostListener("window:mouseenter", ["$event"])
  @HostListener("window:mouseout", ["$event"])
  protected handleMouseMove(ev: MouseEvent) {
    this._actionStream$.next("mouse");
  }
}
