// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from 'ngx-markdown';

@Injectable({ providedIn: 'root' })
export class MarkdownHelpersService {
  private domSanitizer = inject(DomSanitizer);
  private mdService = inject(MarkdownService);

  arrayToBulletList(items: string[]): string {
    return items.map(i => `\n - ${i}`).join('');
  }

  arrayToOrderedList(items: string[], falseyText: string = ""): string {
    if (!items?.length)
      return "";

    return items.map((item, index) => `${index + 1}. ${item.trim() || falseyText}`).join("\n\n");
  }

  async toHtml(markdownContent: string): Promise<string> {
    return this.domSanitizer.sanitize(SecurityContext.HTML, this.domSanitizer.bypassSecurityTrustHtml(await this.mdService.parse(markdownContent, { disableSanitizer: true }))) || "";
  }
}
