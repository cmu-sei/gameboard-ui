import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { IconDefinition, faClipboard } from '@fortawesome/free-solid-svg-icons';

@Injectable({ providedIn: 'root' })
export class FontAwesomeService {
  faClipboard = faClipboard;

  iconToSvg(icon: IconDefinition, width?: number, height?: number): SafeHtml {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 20}" height="${height || 20}" viewBox="0 0 384 512"><path d="${icon.icon[4].toString()}" /></svg>`
  }
}
