import { ActivatedRouteSnapshot } from '@angular/router';

export const GameCenterSelectedTabResolver = (route: ActivatedRouteSnapshot) => {
    console.log("here a route", route);
    // if (!route..params.gameId) {
    //     throw new Error(`${GameIdResolver.name} didn't contain a gameId.`);
    // }

    // return route.parent?.params.gameId;
    return route.url[route.url.length - 1];
}
