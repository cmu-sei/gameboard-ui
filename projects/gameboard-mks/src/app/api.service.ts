// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ConsoleActionResponse, ConsoleActor, ConsoleRequest, ConsoleSummary, KeyValuePair, VmAnswer, VmOperation, VmOptions } from './api.models';
import { UserActivityListenerEventType } from './components/user-activity-listener/user-activity-listener.component';

@Injectable({ providedIn: 'root' })
export class ApiService {
  url = '';
  heartbeat$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    platform: PlatformLocation
  ) {
    const target = platform.getBaseHrefFromDOM();
    const basehref = target.split('/').slice(0, -2).join('/');
    this.url = environment.apiUrl || `${basehref}/api`;

    this.heartbeat$ = interval(60000).pipe(
      switchMap(() => this.ping().pipe(
        map(() => true),
        catchError(err => of(false))
      ))
    );
  }

  redeem(token: string): Observable<any> {
    return this.http.post<any>(this.url + '/user/login?ticket=' + token, {});
  }

  action(model: ConsoleRequest): Observable<ConsoleSummary> {
    return this.http.post<ConsoleSummary>(this.url + `/challenge/console`, model);
  }

  update(id: string, change: KeyValuePair): Observable<any> {
    return this.http.put<any>(this.url + '/vm/' + id + '/change', change);
  }

  answer(id: string, answer: VmAnswer): Observable<any> {
    return this.http.put<any>(this.url + '/vm/' + id + '/answer', answer);
  }

  isos(id: string): Observable<VmOptions> {
    return this.http.get<VmOptions>(this.url + '/vm/' + id + '/isos');
  }

  nets(id: string): Observable<VmOptions> {
    return this.http.get<VmOptions>(this.url + '/vm/' + id + '/nets');
  }

  ping(): Observable<any> {
    return this.http.get<any>(this.url + '/user/ping');
  }

  focus(model: ConsoleRequest): Observable<any> {
    return this.http.put<any>(this.url + `/challenge/console`, model);
  }

  blur(model: ConsoleRequest): Observable<any> {
    return this.http.put<any>(this.url + `/challenge/console`, ({ ...model, name: '' }));
  }

  findConsole(uid: string): Observable<ConsoleActor> {
    return this.http.get<ConsoleActor>(this.url + `/challenge/consoleactor`, { params: { uid } });
  }

  userActivity(eventType: UserActivityListenerEventType): Observable<ConsoleActionResponse> {
    return this.http.post<ConsoleActionResponse>(this.url + `/consoles/active`, null);
  }
}
