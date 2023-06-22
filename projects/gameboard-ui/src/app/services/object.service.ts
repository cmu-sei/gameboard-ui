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

  cloneTruthyKeys<T extends object>(input: T | undefined | null) {
    if (!input) {
      return {} as T;
    }

    const untyped = { ...input } as any;
    const output: any = {};

    if (!input) {
      return {} as T;
    }

    for (const key in untyped) {
      if (!!untyped[key]) {
        output[key] = untyped[key];
      }
    }

    return output as T;
  }
}
