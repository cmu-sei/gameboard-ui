// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdownPlaceholder',
  standalone: true
})
export class MarkdownPlaceholderPipe implements PipeTransform {
  transform(header?: string): string {
    const paragraphs: string[] = [];

    if (header) {
      paragraphs.push(header);
    }
    paragraphs.push("This is a markdown field. You can surround text with _underscores_ to make it italic or double **asterisks** to make it bold. You can also link to content using [this syntax](https://google.com).");

    return paragraphs.join("\n\n").trim();
  }
}
