import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'whitespace',
    standalone: false
})
export class WhitespacePipe implements PipeTransform {
  private static WHITESPACE_REGEX = /\r?\n+/g;

  transform(text: string): string[] {
    if (!text)
      return [];

    const retVal: string[] = [];
    const whitespaceSplits = text.split(WhitespacePipe.WHITESPACE_REGEX);

    for (const whitespaceSplit of whitespaceSplits) {
      if (!whitespaceSplit)
        continue;

      retVal.push(whitespaceSplit.trim());
    }

    return retVal;
  }
}
