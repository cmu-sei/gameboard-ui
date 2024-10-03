import { ActivatedRouteSnapshot } from '@angular/router';

export const GameCenterSelectedTabResolver = (route: ActivatedRouteSnapshot) => {
    return route.url[route.url.length - 1];
}
