// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { GameIdResolver } from './game-id.resolver';

describe('GameIdResolver', () => {
  let resolver: GameIdResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(GameIdResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
