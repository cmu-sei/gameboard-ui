import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) { }

    transform(value: string): string {
        return this.domSanitizer.sanitize(SecurityContext.HTML, value) || '';
    }
}
