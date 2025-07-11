import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'urlRewrite',
    standalone: false
})
export class UrlRewritePipe implements PipeTransform {

  transform(value: string, origin: string): string {
    const finalInput = this.chopSlash(value);
    const finalOrigin = this.appendSlash(origin);

    return encodeURI(`${finalOrigin}${finalInput}`);
  }

  appendSlash(uriBase: string): string {
    if (uriBase[uriBase.length - 1] != "/") {
      uriBase = `${uriBase}/`;
    }

    return uriBase;
  }

  chopSlash(input: string) {
    if (!input || !input.startsWith("/")) {
      return input;
    }

    return input.substring(1);
  }
}
