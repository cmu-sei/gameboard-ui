// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ElementRef, Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable({ providedIn: 'root' })
export class PdfService {

  constructor(private windowService: WindowService) { }

  // this deserves iteration, but it ended up being a lot simpler than most packages for various reasons
  exportHtmlToPdf<TElement extends HTMLElement>(reportTitle: string, elementRef: ElementRef<TElement>) {
    const nativeEl = elementRef.nativeElement;
    const printWindow = this.windowService.get().open("Gameboard Reports", "_blank", `height=${nativeEl.clientHeight},width=${nativeEl.clientWidth}`)!;
    printWindow.document.write(`<html><head><title>${reportTitle}</title>`);
    printWindow.document.write('</head><body>');
    printWindow.document.write(nativeEl.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
}
