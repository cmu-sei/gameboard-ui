import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SlugService {
  private readonly SLUG_REGEX = ;

  slugify(input: string): string {
    return input.replace(this.SLUG_REGEX, '-').toLowerCase();
  }
}
