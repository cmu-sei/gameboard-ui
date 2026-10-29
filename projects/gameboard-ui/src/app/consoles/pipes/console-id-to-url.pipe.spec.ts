// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { RouterService } from '@/services/router.service';
import { ConsoleIdToUrlPipe } from './console-id-to-url.pipe';

describe('ConsoleIdToUrlPipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: RouterService, useValue: {} }]
    });

    const pipe = TestBed.runInInjectionContext(() => new ConsoleIdToUrlPipe());
    expect(pipe).toBeTruthy();
  });
});
