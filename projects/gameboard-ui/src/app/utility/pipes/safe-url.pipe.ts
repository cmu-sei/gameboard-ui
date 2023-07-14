import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeurl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  transform(url?: string): SafeResourceUrl | undefined {
    if (!url)
      return url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
