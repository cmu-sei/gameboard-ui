// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { ChallengeSpecService } from './challenge-spec.service';

describe('ChallengeSpecService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChallengeSpecService = TestBed.get(ChallengeSpecService);
    expect(service).toBeTruthy();
  });
});

