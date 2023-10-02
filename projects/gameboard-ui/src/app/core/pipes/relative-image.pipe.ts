import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeImage' })
export class RelativeImagePipe implements PipeTransform {
  constructor(private config: ConfigService) { }

  transform(value?: string): string | null {
    if (!value)
      return value || null;

    return `${this.config.imagehost}/${value}`;
  }
}
