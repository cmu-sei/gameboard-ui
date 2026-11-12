// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { MarkdownService } from 'ngx-markdown';
import { FontAwesomeService } from '../../services/font-awesome.service';
import { CLASSIFICATION_BANNER_HEIGHT_PROPERTY } from '../../standalone/core/components/classification-banner/classification-banner.component';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  function showToast(): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        { provide: FontAwesomeService, useValue: { iconToSvg: () => '' } },
        { provide: MarkdownService, useValue: { parse: (text: string) => text } },
      ]
    });
    TestBed.inject(ToastService).showMessage('Hello');

    const toasts = document.querySelectorAll<HTMLElement>('.toastify');
    return toasts[toasts.length - 1];
  }

  afterEach(() => {
    document.querySelectorAll('.toastify').forEach(toast => toast.remove());
    document.documentElement.style.removeProperty(CLASSIFICATION_BANNER_HEIGHT_PROPERTY);
  });

  it('shows toasts below the classification banner', () => {
    document.documentElement.style.setProperty(CLASSIFICATION_BANNER_HEIGHT_PROPERTY, '46px');

    expect(new DOMMatrix(getComputedStyle(showToast()).transform).f).toBe(46);
  });

  it('shows toasts at the top of the window without a classification banner', () => {
    expect(new DOMMatrix(getComputedStyle(showToast()).transform).f).toBe(0);
  });
});
