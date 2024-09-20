import { inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

export const GameIdResolver = (route: ActivatedRouteSnapshot) => {
    if (!route.parent?.params.gameId) {
        throw new Error(`${GameIdResolver.name} didn't contain a gameId.`);
    }

    return route.parent?.params.gameId;
}
