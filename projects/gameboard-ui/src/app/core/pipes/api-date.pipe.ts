import { Pipe, PipeTransform } from '@angular/core';

// This is here because for some reason, the current middleware in the API returns date objects
// as json strings. Need to parse them to date for a lot of applications.
@Pipe({ name: 'apiDate' })
export class ApiDatePipe implements PipeTransform {
  transform(value: string | Date): Date {
    return new Date(value);
  }
}
