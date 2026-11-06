// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ActivatedRouteSnapshot } from '@angular/router';

import { GameIdResolver } from './game-id.resolver';

describe('GameIdResolver', () => {
  function routeWithParentParams(params: Record<string, string>) {
    return { parent: { params } } as unknown as ActivatedRouteSnapshot;
  }

  it('resolves the gameId from the parent route', () => {
    expect(GameIdResolver(routeWithParentParams({ gameId: 'game-1' }))).toBe('game-1');
  });

  it('throws when the parent route has no gameId', () => {
    expect(() => GameIdResolver(routeWithParentParams({}))).toThrowError(/didn't contain a gameId/);
  });
});
