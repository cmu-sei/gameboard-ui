import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {

  transform<TSource, TProperty>(value: TSource[], property: keyof TSource, mustMatchValue: TProperty): TSource[] {
    if (!value || !value.length)
      return value;

    return value.filter(v => v[property] === mustMatchValue) || [];
  }
}
