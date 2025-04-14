import { AfterViewInit, Component, inject, input, OnDestroy, output } from '@angular/core';
import { Edge } from './edge-hover-listener.models';
import { DOCUMENT } from '@angular/common';
import { debounceTime, distinctUntilChanged, fromEvent, map, Subscription } from 'rxjs';

@Component({
  selector: 'gb-edge-hover-listener',
  standalone: true,
  template: ""
})
export class EdgeHoverListenerComponent implements AfterViewInit, OnDestroy {
  // i/o
  edge = input.required<Edge>();
  threshold = input<number>(400);
  isHovering = output<boolean>();

  // injection
  private doc = inject(DOCUMENT);

  // internal state
  private mouseSub?: Subscription;

  public ngAfterViewInit(): void {
    this.mouseSub = fromEvent(this.doc, "mousemove").pipe(
      map(e => e as MouseEvent),
      map(e => e.clientX < this.threshold()),
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(isHovering => this.isHovering.emit(isHovering));
  }

  public ngOnDestroy(): void {
    this.mouseSub?.unsubscribe();
  }
}
