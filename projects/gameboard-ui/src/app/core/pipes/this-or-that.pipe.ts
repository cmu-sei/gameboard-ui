import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'thisOrThat' })
export class ThisOrThatPipe implements PipeTransform {

  transform<T>(value: boolean, ifTrue: T, ifFalse: T): T {
    return value ? ifTrue : ifFalse;
  }
}
