import { hasProperty } from '@/../tools/functions';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arrayProperty' })
export class ArrayPropertyPipe<T extends {}, U> implements PipeTransform {
  transform(value: T, propertyName: string): U[] | null {
    if (!value || !Array.isArray(value))
      return null;

    const retVal: U[] = [];
    for (const item of value) {
      if (hasProperty(item, propertyName))
        retVal.push((item as any)[propertyName]);
    }

    return retVal;
  }
}
