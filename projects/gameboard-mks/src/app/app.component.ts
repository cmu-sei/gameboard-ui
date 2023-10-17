// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleRequest } from './api.models';
import { debounceTime, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gameboard-mks';
  context: Observable<ConsoleRequest>;
  errorMsg = '';

  constructor(
    route: ActivatedRoute,
    // api: ApiService
  ) {
    this.context = route.queryParams.pipe(
      debounceTime(500),
      map(p => ({
        name: p.v,                      // The name of the VM (v=abc)
        sessionId: p.s,                 // The hexadecimal ID of the gamespace (s=7cd...)
        token: p.t,                     // 
        fullbleed: p.f,                 // Whether this window covers the whole page (f=0 or f=1)
        observer: p.o,                  // Whether this challenge is being observed (o=0 or o=1)
        userId: p.u,                    // The hexadecimal ID of the user trying to access the VM (u=e3c...)
        enableActivityListener: !!p.l   // Whether the user activity listener is enabled (only affects practice consoles) (true if l=[any true-ish value])
      }))
      // switchMap(p => api.redeem(p.token).pipe(
      //   catchError(err => of(p)),
      //   map(r => p)
      // ))
    );
  }
}
