import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'gameMapImageUrl' })
export class GameMapImageUrlPipe implements PipeTransform {
  constructor(private config: ConfigService) { }

  transform(value?: string): string {
    return value ?
      `${this.config.imagehost}/${value}`
      : `${this.config.basehref}assets/map.png`;
  }
}
