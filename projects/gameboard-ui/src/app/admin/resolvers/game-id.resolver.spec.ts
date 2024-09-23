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
