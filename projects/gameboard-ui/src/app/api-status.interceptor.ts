import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, finalize, tap, startWith } from 'rxjs';
import { ApiStatus } from './api/api-status.service';

// not sure how much sense this makes, but I'm trying it. Basically, it feels funky
// to ask consumers to inject an HttpInterceptor rather than a service (even though they're
// closely related and both injectable), so I just gave this thing an observable. It
// can be read by any consumer if they want, but this lets them ignore the implementation detail of
// HttpInterceptor and just consume the service, independent of what's powering it.
@Injectable()
export class ApiStatusInterceptor implements HttpInterceptor {
    private _apiStatus$ = new Subject<ApiStatus>();
    public apiStatus$ = this._apiStatus$
        .asObservable().pipe(startWith("up" as ApiStatus));

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let finalResponse: HttpEvent<any> | HttpErrorResponse;

        return next.handle(req).pipe(
            tap({
                next: successResponse => finalResponse = successResponse,
                error: err => finalResponse = err
            }),
            finalize(() => {
                this._apiStatus$.next(finalResponse instanceof HttpErrorResponse ? "down" : "up");
            })
        );
    }
}
