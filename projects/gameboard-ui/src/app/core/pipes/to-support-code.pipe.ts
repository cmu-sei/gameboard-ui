import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toSupportCode' })
export class ToSupportCodePipe implements PipeTransform {

  transform(value: { id: string, tag: string }): string {
    if (!value?.tag) {
      return value.tag;
    }

    const idLength = Math.min(value.id.length, 8);
    return `${value.id.slice(0, idLength)} ${value.tag}`;
  }
}
