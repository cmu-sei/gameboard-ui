import { Pipe, PipeTransform } from '@angular/core';

export interface LinkRendererToken {
  isUrl: boolean;
  text: string;
}

@Pipe({ name: 'linkRenderer' })
export class LinkRendererPipe implements PipeTransform {
  private static URL_REGEX = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g;

  transform(text: string): LinkRendererToken[] {
    if (!text)
      return [];

    const retVal = [];
    const splits = text.split(LinkRendererPipe.URL_REGEX);

    for (const split of splits) {
      if (!split)
        continue;

      retVal.push({ text: split, isUrl: !!split.match(LinkRendererPipe.URL_REGEX) })
    }

    return retVal;
  }
}
