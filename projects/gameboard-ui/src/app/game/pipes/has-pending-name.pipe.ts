import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hasPendingName' })
export class HasPendingNamePipe implements PipeTransform {

  transform(namedThing: { name: string, approvedName: string, nameStatus: string }): boolean {
    return (!!namedThing.name && namedThing.name !== namedThing.approvedName);
  }
}
