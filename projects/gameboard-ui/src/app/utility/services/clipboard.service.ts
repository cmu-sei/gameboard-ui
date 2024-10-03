// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private _clipboard: Clipboard;

  constructor(@Inject(DOCUMENT) private dom: Document) {
    this._clipboard = navigator.clipboard;
  }

  async copy(text: string) {
    await this._clipboard.writeText(text);
  }

  async paste(): Promise<string> {
    return await this._clipboard.readText();
  }
}
