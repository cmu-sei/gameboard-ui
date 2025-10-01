// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) { }

  transform(url?: string): SafeResourceUrl | undefined {
    if (!url)
      return url;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
