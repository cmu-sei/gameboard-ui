// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, signal } from '@angular/core';

/**
 * Lets a page leave the classification banner off its printout. Printouts keep the banner by
 * default, since it marks them; a page that prints a fixed layout of its own (a certificate filling
 * one landscape page) turns it off while it's shown.
 */
@Injectable({ providedIn: 'root' })
export class ClassificationBannerService {
  private readonly _isHiddenInPrint = signal(false);
  public readonly isHiddenInPrint = this._isHiddenInPrint.asReadonly();

  setHiddenInPrint(isHidden: boolean) {
    this._isHiddenInPrint.set(isHidden);
  }
}
