import { ConfigService } from '@/utility/config.service';
import { DOCUMENT } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'gameMapImageUrl' })
export class GameMapImageUrlPipe implements PipeTransform {
  private document = inject(DOCUMENT);
  constructor(private config: ConfigService) { }

  transform(value?: string): string {
    if (!value) {
      return `${this.config.basehref}assets/map.png`;
    }

    const isAbsolute = new URL(this.document.baseURI).origin !== new URL(value, this.document.baseURI).origin;
    return isAbsolute ? value : `${this.config.imagehost}/${value}`;
  }
}
