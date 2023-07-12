import { SortService } from '@/services/sort.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {
  constructor(private sortService: SortService) { }

  transform<TItem, TCompare>(value: TItem[], compareProperty: string, descending = false): any[] {
    if (!value || !value.length) {
      return value;
    }

    return this.sortService.sort({
      array: value,
      transform: (item: TItem) => (item as any)[compareProperty] as TCompare,
      direction: descending ? "desc" : "asc"
    });
  }
}
