import { SortDirection } from '@/api/models';
import { Injectable } from '@angular/core';

export interface SortArgs<TItems, TTransformed> {
  array: TItems[],
  transform?: (item: TItems) => TTransformed;
  compare?: (a: TTransformed, b: TTransformed) => -1 | 0 | 1;
  direction?: SortDirection
}

@Injectable({ providedIn: 'root' })
export class SortService {
  constructor() { }

  sort<TItems, TTransformed>(args: SortArgs<TItems, TTransformed>) {
    const toSort = [...args.array];
    const transform = args.transform || ((item: TItems) => item as unknown as TTransformed);
    const compare = args.compare || this.compare;
    const sortDirection = args.direction || "asc";

    return toSort.sort((a, b) => {
      const transformedA = transform(a);
      const transformedB = transform(b);

      return this.maybeInvertResult(
        (
          compare ?
            compare(transformedA, transformedB) :
            this.compare(transformedA, transformedB)
        ), sortDirection
      );
    });
  }

  private compare<T>(a: T, b: T) {
    let result = 0;

    if (a < b)
      result = -1;
    else if (a > b)
      result = 1;

    return result;
  }

  private maybeInvertResult(result: number, direction: SortDirection) {
    return result * (direction === "asc" ? 1 : -1);
  }
}
