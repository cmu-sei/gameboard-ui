// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ConsoleIdToUrlPipe } from './console-id-to-url.pipe';

describe('ConsoleIdToUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new ConsoleIdToUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
