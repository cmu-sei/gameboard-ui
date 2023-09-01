import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toggleClass' })
export class ToggleClassPipe implements PipeTransform {

  transform(value: boolean, classTrue: string, classFalse: string, otherClasses: string): string {
    return `${otherClasses} ${value ? classTrue : classFalse}`;
  }
}
