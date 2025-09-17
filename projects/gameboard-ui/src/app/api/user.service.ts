// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { Announcement, ApiUser, ChangedUser, ListUsersResponseUser, NewUser, RequestNameChangeRequest, RequestNameChangeResponse, TreeNode, TryCreateUserResult, TryCreateUsersRequest, TryCreateUsersResponse, UpdateUserSettingsRequest, UserSettings } from './user-models';
import { LogService } from '@/services/log.service';
import { ApiUrlService } from '@/services/api-url.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _nameChanged$ = new Subject<RequestNameChangeResponse>();
  public nameChanged$ = this._nameChanged$.asObservable();

  private _settingsUpdated$ = new Subject<UserSettings>();
  public settingsUpdated$ = this._settingsUpdated$.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private config: ConfigService,
    private http: HttpClient,
    private log: LogService
  ) { }

  public list(filter: any): Observable<ListUsersResponseUser[]> {
    return this.http.get<ListUsersResponseUser[]>(this.apiUrl.build("users"), { params: filter });
  }

  public retrieve(id: string): Observable<ApiUser> {
    return this.http.get<ApiUser>(this.apiUrl.build(`user/${id}`));
  }

  public tryCreate(model: NewUser): Observable<TryCreateUserResult> {
    return this.http.post<TryCreateUserResult>(this.apiUrl.build("user"), model);
  }

  public tryCreateMany(req: TryCreateUsersRequest) {
    return firstValueFrom(this.http.post<TryCreateUsersResponse>(this.apiUrl.build("users"), req));
  }

  public update(model: ChangedUser): Observable<ApiUser> {
    return this.http.put<any>(this.apiUrl.build("user"), model).pipe();
  }

  public delete(id: string): Observable<any> {
    return this.http.delete<any>(this.apiUrl.build(`user/${id}`));
  }

  public logout(): Observable<any> {
    return this.http.post<any>(this.apiUrl.build("user/logout"), null);
  }

  public async requestNameChange(userId: string, request: RequestNameChangeRequest): Promise<RequestNameChangeResponse> {
    const response = await firstValueFrom(this.http.put<RequestNameChangeResponse>(this.apiUrl.build(`user/${userId}/name`), request).pipe());
    this._nameChanged$.next(response);
    return response;
  }

  public ticket(): Observable<any> {
    return this.http.post<any>(this.apiUrl.build("user/ticket"), null);
  }

  public getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.apiUrl.build("user/settings"));
  }

  public updateSettings(update: UpdateUserSettingsRequest): Observable<UserSettings> {
    return this.http.put<UserSettings>(this.apiUrl.build("user/settings"), update).pipe(
      tap(settings => this._settingsUpdated$.next(settings))
    );
  }

  public announce(model: Announcement): Observable<any> {
    return this.http.post<any>(this.apiUrl.build("announce"), model);
  }

  // records a login event for the currently authorized user
  public updateLoginEvents(): Observable<void> {
    this.log.logInfo("User login event recorded");
    return this.http.put<void>(this.apiUrl.build("user/login"), {});
  }
}
