import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeUrls' })
export class RelativeUrlsPipe implements PipeTransform {

  // goal here: transform a relative link in markdown to an absolute one using the `uriBase` param as the origin
  transform(value: string, uriBase: string): string | undefined {
    if (!value) {
      return value;
    }

    if (!uriBase) {
      throw new Error("Can't use the 'relativeUrls' pipe without a 'uriBase' argument.");
    }

    // force the base to end with slash
    const finalBase = this.standardizeUriBase(uriBase);

    // identify all markdown images with relative urls. Format:
    // ![the text displayed for the image](https://the.url.ofthe.img)
    const regex = /!\[([\s\S]+)\]\((\S+)\)/gm;

    return value.replace(regex, (match, text, url) => {
      // if the url is relative, a new doc relative to the current origin will have the same origin
      const isRelative = new URL(document.baseURI).origin === new URL(url, document.baseURI).origin;

      // if it's a relative url, perform the replacement, otherwise don't
      return isRelative ? `![${text}](${finalBase}${url})` : match;
    });
  }

  standardizeUriBase(uriBase: string): string {
    if (uriBase[uriBase.length - 1] != "/") {
      uriBase = `${uriBase}/`;
    }

    return uriBase;
  }
}
