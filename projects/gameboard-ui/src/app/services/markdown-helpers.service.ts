import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MarkdownHelpersService {
  arrayToBulletList(items: string[]): string {
    return items.map(i => `\n - ${i}`).join('');
  }
}
