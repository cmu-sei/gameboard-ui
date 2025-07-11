import { ConfigService } from '@/utility/config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'assetPath',
    standalone: false
})
export class AssetPathPipe implements PipeTransform {
  constructor(private config: ConfigService) { }

  transform(value?: string, defaultAssetPath?: string): string | undefined {
    if (!value) {
      return value;
    }

    return value ? `${this.config.imagehost}/${value}`
      : defaultAssetPath
        ? `${this.config.basehref}assets/${defaultAssetPath}` : undefined;
  }
}
