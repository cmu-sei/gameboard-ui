import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import linkifyHtml from 'linkify-html';

@Pipe({ name: 'linkifyHtml' })
export class LinkifyHtmlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) { }

  transform(value: string, ...args: unknown[]): string {
    return this.domSanitizer.sanitize(SecurityContext.HTML, linkifyHtml(value, { nl2br: true })) || "";
  }
}
