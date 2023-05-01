import { Injectable } from '@angular/core';
import { UserService } from '../utility/user.service';

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
    const finalKey = this.prependKey(key);

    if (throwIfExists && this._client.getItem(finalKey) !== null) {
      throw new Error(`Storage key ${finalKey} already exists in local storage.`);
    }

    this._client.setItem(finalKey, value);
  }

  /**
  * Adds the given string to local storage.
  *
  * @remarks
  * This is functionally identical to `.add`; however, it's a separate signature
  * because you should only do it if you really have to. Most common scenarios
  * require you to add an entry for your key to the `StorageKey` enum. This is just
  * here for cases in which the key is dynamic and not known at design time.
  *
  * @param key - The local storage key
  * @param value - The local storage value
  * @param throwIfExists - Lets you specify whether you want an exception if the key exists
  */
  addArbitrary = (key: string, value: string, throwIfExists = false) => this.add(key as StorageKey, value, throwIfExists);

  clear(...keys: StorageKey[]): void {
    for (const key in keys) {
      this._client.removeItem(this.prependKey(key));
    }
  }

  get(key: StorageKey, throwIfNotExists = false) {
    const finalKey = this.prependKey(key);
    const value = this._client.getItem(finalKey);

    if (value === null && throwIfNotExists) {
      throw new Error(`Storage key ${finalKey} doesn't exist in local storage.`);
    }

    return value;
  }

  getArbitrary = (key: string, throwIfNotExists = false) => this.get(key as StorageKey, throwIfNotExists);

  has(key: string): boolean {
    return !!this._client.getItem(this.prependKey(key));
  }

  remove(throwIfNotExists = false, ...keys: StorageKey[]): void {
    this.removeArbitrary(throwIfNotExists, ...keys.map(key => this.prependKey(key)));
  }

  removeArbitrary(throwIfNotExists = false, ...keys: string[]): void {
    keys.forEach(key => {
      const finalKey = this.prependKey(key);
      if (throwIfNotExists && !this._client.getItem(finalKey.toString())) {
        throw new Error(`Storage key ${finalKey} doesn't exist in local storage.`);
      }

      if (this._client.getItem(key)) {
        this._client.removeItem(key);
      }
    });
  }

  private prependKey(key: string | StorageKey) {
    // const user = this.userService.user$.value;

    // if (user)
    //   // todo: prepend with user id, but there's a circular dependency problem to solve
    //   // return `gb:${user.id}:${key}`;
    //   return `gb:${key}`;

    // for now, don't prepend because of incompatibility with how auth service changed/works
    // return `gb:${key}`;
    return key;
  }
}
