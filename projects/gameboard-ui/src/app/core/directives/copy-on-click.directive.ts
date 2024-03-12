import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';

@Directive({ selector: '[appCopyOnClick]' })
export class CopyOnClickDirective implements AfterViewInit {
  @Input('appCopyOnClick') text?: string;

  constructor(
    private elementRef: ElementRef,
    private clipboardService: ClipboardService,
    private toastService: ToastService) { }

  ngAfterViewInit() {
    const existingOnClick = this.elementRef.nativeElement.onclick;
    this.elementRef.nativeElement.onclick = () => {
      if (existingOnClick)
        existingOnClick();

      const text = (this.text || this.elementRef.nativeElement.innerHTML).trim();
      if (text) {
        this.clipboardService.copy(text);
        this.toastService.showMessage(`Copied "${text}" to your clipboard.`);
      }
    };
  }
}
