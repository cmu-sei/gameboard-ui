import { Injectable } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Injectable({ providedIn: 'root' })
export class MarkdownHelpersService {
  constructor(private markdownService: MarkdownService) { }

  arrayToBulletList(items: string[]): string {
    return items.map(i => `\n - ${i}`).join('');
  }

  arrayToOrderedList(items: string[], falseyText: string = ""): string {
    if (!items?.length)
      return "";

    return items.map((item, index) => `${index + 1}. ${item.trim() || falseyText}`).join("\n\n");
  }

  getMarkdownPlaceholderHelp(header?: string): string {
    const paragraphs: string[] = [];

    if (header)
      paragraphs.push(header);

    paragraphs.push("This is a markdown field. You can surround text with _underscores_ to make it italic or double **asterisks** to make it bold. You can also [link to content using this syntax](https://google.com).");

    return paragraphs.join("\n\n").trim();
  }

  toHtml(markdownContent: string) {
    return this.markdownService.parse(markdownContent);
  }
}
