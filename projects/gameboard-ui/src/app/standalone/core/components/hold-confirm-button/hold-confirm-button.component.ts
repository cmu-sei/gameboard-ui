import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent, interval, switchMap, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
    selector: 'app-hold-confirm-button',
    imports: [CommonModule],
    templateUrl: './hold-confirm-button.component.html',
    styleUrls: ['./hold-confirm-button.component.scss']
})
export class HoldConfirmButtonComponent implements AfterViewInit {
  @Input() confirmTimeMs = 1500;
  @Output() click = new EventEmitter<HTMLButtonElement>();

  @ViewChild("button") buttonRef?: ElementRef<HTMLButtonElement>;

  constructor(private unsub: UnsubscriberService) { }

  ngAfterViewInit(): void {
    if (!this.buttonRef?.nativeElement)
      throw new Error("Couldn't resolve the button.");

    const button = this.buttonRef.nativeElement;
    const mouseDown$ = fromEvent(button, 'mousedown');
    const mouseUp$ = fromEvent(button, 'mouseup');
    const mouseLeave$ = fromEvent(button, 'mouseleave');

    this.unsub.add(
      mouseDown$.pipe(
        switchMap(() =>
          timer(1500).pipe(
            takeUntil(mouseUp$),
            takeUntil(mouseLeave$)
          )
        )
      ).subscribe(() => this.click.emit(button))
    );
  }
}
