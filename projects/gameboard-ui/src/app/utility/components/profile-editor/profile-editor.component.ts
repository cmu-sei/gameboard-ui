// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { asyncScheduler, combineLatest, Observable, of, scheduled, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, filter, map, mergeAll, switchMap } from 'rxjs/operators';
import { Sponsor } from '../../../api/sponsor-models';
import { SponsorService } from '../../../api/sponsor.service';
import { ApiUser } from '../../../api/user-models';
import { UserService as ApiUserService } from '../../../api/user.service';
import { UserService } from '../../../utility/user.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {
  ctx$: Observable<any>;
  updating$ = new Subject<ApiUser>();
  errors = [];

  constructor(
    api: ApiUserService,
    userSvc: UserService,
    sponsorSvc: SponsorService
  ) {

    const currentUser$ = scheduled([
      userSvc.user$.pipe(
        filter(u => !!u)
      ),
      this.updating$.pipe(
        debounceTime(500),
        filter(u => !!u.name.trim()),
        switchMap(u => api.update(u))
        // todo handle errors
      )
    ], asyncScheduler).pipe(
      mergeAll()
    );

    this.ctx$ = combineLatest([
      currentUser$,
      sponsorSvc.list('')
    ]).pipe(
      map(([user, sponsors]) => ({user, sponsors}))
    );
  }

  ngOnInit(): void {
  }

  setSponsor(u: ApiUser, s: Sponsor): void {
    this.updating$.next({...u, sponsor: s.logo});
  }
}
