// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject } from "@angular/core";
import { MonoTypeOperatorFunction } from "rxjs";
import { TapObserver, tap } from "rxjs/internal/operators/tap";
import { LogService } from "@/services/log.service";

export function logTap<T>(
    observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null,
    transform?: (source: T) => string,
    error?: ((e: any) => void) | null,
    complete?: (() => void) | null
): MonoTypeOperatorFunction<T> {
    return (source) => source.pipe(tap(s => inject(LogService).logInfo(transform ? transform(s) : s)));
}
