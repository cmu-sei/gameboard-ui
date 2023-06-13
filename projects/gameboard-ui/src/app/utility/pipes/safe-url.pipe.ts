import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeurl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  transform(url: any, ...args: unknown[]): unknown {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
