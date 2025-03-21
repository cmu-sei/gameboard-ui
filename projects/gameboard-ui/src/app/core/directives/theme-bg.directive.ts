import { AfterViewInit, Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Directive({
  selector: '[appThemeBg]',
  standalone: true
})
export class ThemeBgDirective implements AfterViewInit {
  private hostElement = inject(ElementRef);
  private theme = inject(ThemeService);
  private renderer = inject(Renderer2);

  constructor() {

  }

  ngAfterViewInit(): void {
    if (this.hostElement.nativeElement) {
      this.renderer.addClass(this.hostElement.nativeElement, this.theme.getThemeBgClass());
    }
  }
}
