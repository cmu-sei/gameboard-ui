import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appDynamicReport]' })
export class DynamicReportDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
