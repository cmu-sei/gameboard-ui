import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ObjectService {
  deleteKeys<T>(input: T, ...keys: string[]) {
    const untyped = input as any;

    for (let key of keys) {
      delete untyped[key];
    }

    return untyped;
  }

  // Clones all keys of an object which have a "truthy" value or have the value 0.
  // The 0 is for reports, and no, I don't feel great about this either.
  cloneTruthyAndZeroKeys<T extends object>(input: T | undefined | null) {
    if (!input) {
      return {} as T;
    }

    const untyped = { ...input } as any;
    const output: any = {};

    if (!input) {
      return {} as T;
    }

    for (const key in untyped) {
      if (!!untyped[key] || untyped[key] == 0) {
        output[key] = untyped[key];
      }
    }

    return output as T;
  }

  deepEquals<T1, T2>(obj1: T1, obj2: T2): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
