import { Injectable } from '@angular/core';

export enum StorageKey {
  Gameboard = "gameboard",
  UnityGameLink = "gameServerLink",
  UnityOidcLink = "oidcLink",
  WantsGameHubConnections = "wantsGameHubConnections"
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  readonly Client: Storage = window.localStorage;
  private _client = this.Client;

  add(key: StorageKey, value: string, throwIfExists = false): void {
    if (throwIfExists && this._client.getItem(key) !== null) {
      throw new Error(`Storage key ${key} already exists in local storage.`);
    }

    this._client.setItem(key, value);
  }

  /**
  * Adds the given string to local storage.
  *
  * @remarks
  * This is functionally identical to `.add`; however, it's a separate signature
  * because you should only do it if you really have to. Most common scenarios
  * require you to add an entry for your key to the `StorageKey` enum. This is just
  * here for cases in which the key is dynamic and not known at compile time.
  *
  * @param key - The local storage key
  * @param value - The local storage value
  * @param throwIfExists - Lets you specify whether you want an exception if the key exists
  */
  addArbitrary = (key: string, value: string, throwIfExists = false) => this.add(key as StorageKey, value, throwIfExists);

  clear(...keys: StorageKey[]): void {
    for (const key in keys) {
      this._client.removeItem(key);
    }
  }

  get(key: StorageKey, throwIfNotExists = false) {
    const value = this._client.getItem(key);

    if (value === null && throwIfNotExists) {
      throw new Error(`Storage key ${key} doesn't exist in local storage.`);
    }

    return value;
  }

  getArbitrary = (key: string, throwIfNotExists = false) => this.get(key as StorageKey, throwIfNotExists);

  has(key: string): boolean {
    return !!this._client.getItem(key);
  }

  remove(throwIfNotExists = false, ...keys: StorageKey[]): void {
    this.removeArbitrary(throwIfNotExists, ...keys.map(key => key.toString()));
  }

  removeArbitrary(throwIfNotExists = false, ...keys: string[]): void {
    keys.forEach(key => {
      if (throwIfNotExists && !this._client.getItem(key.toString())) {
        throw new Error(`Storage key ${key} doesn't exist in local storage.`);
      }

      if (this._client.getItem(key)) {
        this._client.removeItem(key);
      }
    });
  }

  removeIf(predicate: (key: string, value: string) => boolean) {
    const keysToRemove: string[] = []

    for (var i = 0; i < this._client.length; ++i) {
      const key = localStorage.key(i);
      const value = this.getArbitrary(key!);

      if (predicate(key!, value!)) {
        keysToRemove.push(key!);
      }
    }

    this.clear(...keysToRemove as StorageKey[]);
  }
}
