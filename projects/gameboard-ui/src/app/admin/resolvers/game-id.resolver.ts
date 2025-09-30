// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ActivatedRouteSnapshot } from '@angular/router';

export const GameIdResolver = (route: ActivatedRouteSnapshot) => {
    if (!route.parent?.params.gameId) {
        throw new Error(`${GameIdResolver.name} didn't contain a gameId.`);
    }

    return route.parent?.params.gameId;
}
