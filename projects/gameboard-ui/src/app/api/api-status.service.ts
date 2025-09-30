// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Inject, Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiStatusInterceptor } from '@/api-status.interceptor';

export type ApiStatus = "up" | "down";

@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private _apiStatusInterceptor: ApiStatusInterceptor;
  public status$: Observable<ApiStatus>;

  constructor(@Inject(HTTP_INTERCEPTORS) allHttpInterceptors: HttpInterceptor[]) {
    const apiStatusInterceptor = allHttpInterceptors.find(i => i instanceof ApiStatusInterceptor);
    if (!apiStatusInterceptor)
      throw new Error("Couldn't resolve the api status interceptor.");

    this._apiStatusInterceptor = apiStatusInterceptor as ApiStatusInterceptor;
    this.status$ = this
      ._apiStatusInterceptor
      .apiStatus$
      .pipe(
        distinctUntilChanged(),
        debounceTime(5000)
      );
  }
}
