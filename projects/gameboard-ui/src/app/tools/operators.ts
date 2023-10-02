import { MonoTypeOperatorFunction, Observable, Subscriber } from "rxjs";
import { TapObserver, tap } from "rxjs/internal/operators/tap";
import { LogService } from "@/services/log.service";
import { inject } from "@angular/core";

export function logTap<T>(
    observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null,
    transform?: (source: T) => string,
    error?: ((e: any) => void) | null,
    complete?: (() => void) | null
): MonoTypeOperatorFunction<T> {
    return (source) => source.pipe(tap(s => inject(LogService).logInfo(transform ? transform(s) : s)));
}
