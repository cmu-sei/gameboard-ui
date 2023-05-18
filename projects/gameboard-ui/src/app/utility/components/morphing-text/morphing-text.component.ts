import { AfterViewInit, Component, ElementRef, Input, SecurityContext, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-morphing-text',
  templateUrl: './morphing-text.component.html',
  styleUrls: ['./morphing-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MorphingTextComponent implements AfterViewInit {
  @Input() cooldownTime = 4;
  @Input() morphTime = 2;
  @Input() messages: string[] = [
    "Preparing for departure to Cubespace...",
    "Starting preflight checks...",
    "Propulsion systems: **ONLINE**.",
    "Fuel reserves: **NOMINAL**.",
    "Planetary scanning array: **5x5**",
    "External stabilizers: **STABLE**",
    "Cargo weight: **WNL**.",
    "ALL SYSTEMS: **GREEN**.",
    "Dauntless, you are **cleared for departure**."
  ];
  @Input() emphasisExpression = /[A-Z]/g;
  @Input() isRandom = false;

  public text1Content: SafeHtml = "";
  public text2Content: SafeHtml = "";

  @ViewChild("text1") text1!: ElementRef<HTMLSpanElement>;
  @ViewChild("text2") text2!: ElementRef<HTMLSpanElement>;

  private _cooldown = this.cooldownTime;
  private _morph = 0;
  private _referenceTime = new Date();
  private _textIndex = this.messages.length - 1;

  constructor(
    private markdown: MarkdownService,
    private sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
    this.updateTextContent(this._textIndex % this.messages.length, (this._textIndex + 1) % this.messages.length);
    this.animate();
  }

  private doMorph(nextIndex: number) {
    this._morph -= this._cooldown;
    this._cooldown = 0;

    let fraction = this._morph / this.morphTime;
    if (fraction > 1) {
      this._cooldown = this.cooldownTime;
      fraction = 1;
    }

    this.setMorph(fraction, nextIndex);
  }

  private setMorph(fraction: number, nextIndex: number) {
    this.text2.nativeElement.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    this.text2.nativeElement.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    this.text1.nativeElement.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    this.text1.nativeElement.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    this.updateTextContent(this._textIndex, nextIndex);
  }

  private updateTextContent(index: number, nextIndex: number) {
    this.text1Content = this.renderTextContent(this.messages[index % this.messages.length]);
    this.text2Content = this.renderTextContent(this.messages[nextIndex % this.messages.length]);
  }

  private doCooldown() {
    this._morph = 0;

    this.text2.nativeElement.style.filter = "";
    this.text2.nativeElement.style.opacity = "100%";

    this.text1.nativeElement.style.filter = "";
    this.text1.nativeElement.style.opacity = "0%";
  }

  private resolveNextIndex(currentIndex: number) {
    if (!this.isRandom) {
      return currentIndex + 1 % this.messages.length;
    }

    const random = Math.floor(Math.random() * (this.messages.length));
    return random === currentIndex ? random - 1 : random;
  }

  private animate(timestamp?: DOMHighResTimeStamp) {
    requestAnimationFrame(this.animate.bind(this));

    const shouldAdvanceIndex = this._cooldown > 0;
    const newTime = new Date();
    const dt = (newTime.getTime() - this._referenceTime.getTime()) / 1000;
    this._referenceTime = newTime;
    this._cooldown -= dt;

    if (this._cooldown <= 0) {
      if (shouldAdvanceIndex) {
        this._textIndex = this.resolveNextIndex(this._textIndex);
      }

      this.doMorph(this._textIndex);
    }
    else {
      this.doCooldown();
    }
  }

  private renderTextContent(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.markdown.parse(
        this.sanitizer.sanitize(SecurityContext.HTML, text) || ""
      )
    );
  }
}
