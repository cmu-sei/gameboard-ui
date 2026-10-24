// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WindowService } from './window.service';

describe('WindowService', () => {
  let appContainer: HTMLElement;

  beforeEach(() => {
    // Like the app container when a classification banner is shown: a fixed height that scrolls.
    appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    appContainer.style.height = '100px';
    appContainer.style.overflow = 'auto';
    appContainer.innerHTML = '<div style="height: 1000px"></div>';
    document.body.appendChild(appContainer);
  });

  afterEach(() => appContainer.remove());

  it('scrolls the app container to the bottom when it is the one scrolling', fakeAsync(() => {
    TestBed.inject(WindowService).scrollToBottom();
    tick(500);

    expect(appContainer.scrollTop).toBe(appContainer.scrollHeight - appContainer.clientHeight);
  }));
});
