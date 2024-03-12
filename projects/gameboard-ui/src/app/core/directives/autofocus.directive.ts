import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  constructor(private ref: ElementRef) { }

  ngAfterViewInit(): void {
    // i hate that this works
    setTimeout(() => {
      this.ref?.nativeElement?.focus();
    }, 0);
  }
}
