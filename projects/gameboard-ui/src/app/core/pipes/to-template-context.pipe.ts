import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toTemplateContext',
    standalone: false
})
export class ToTemplateContextPipe implements PipeTransform {

  transform(value: unknown): Object | null {
    const ctx = (!value ? null : value) as Object;

    return {
      $implicit: ctx,
      context: ctx
    };
  }
}
