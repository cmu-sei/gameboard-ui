// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WindowService } from './window.service';

describe('WindowService', () => {
  // The window scrolls the page, with or without a classification banner (see classification-banner.component.scss).
  it('scrolls the window to the bottom', fakeAsync(() => {
    const scrollTo = spyOn(window, 'scrollTo');

    TestBed.inject(WindowService).scrollToBottom();
    tick(500);

    expect(scrollTo).toHaveBeenCalledWith(0, document.body.scrollHeight);
  }));
});
