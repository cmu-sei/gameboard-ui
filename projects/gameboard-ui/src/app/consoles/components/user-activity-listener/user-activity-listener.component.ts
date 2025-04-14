import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Subject, Subscription, throttleTime } from 'rxjs';
import { ConsoleUserActivityType } from '@/api/consoles.models';

@Component({
  selector: 'app-user-activity-listener',
  standalone: true,
  template: "",
})
export class UserActivityListenerComponent {
  @Output() userAction = new EventEmitter<ConsoleUserActivityType>();

  private _actionStream$ = new Subject<ConsoleUserActivityType>();
  private _actionStreamSub: Subscription;

  constructor() {
    this._actionStreamSub = this._actionStream$
      .pipe(throttleTime(60000))
      .subscribe(ev => {
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
