// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { faSync, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, combineLatest, Observable, of, scheduled, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, filter, map, mergeAll, switchMap, tap } from 'rxjs/operators';
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

  faSync = faSyncAlt;

  disallowedName: string | null = null;
  disallowedReason: string | null = null;

  constructor(
    api: ApiUserService,
    private userSvc: UserService,
    sponsorSvc: SponsorService
  ) {

    const currentUser$ = scheduled([
      userSvc.user$.pipe(
        filter(u => !!u)
      ),
      this.updating$.pipe(
        debounceTime(500),
        filter(u => !!u.name.trim()),
        tap(u => {
          // If the user's name isn't the disallowed one, mark it as pending
          if (u.name != this.disallowedName) u.nameStatus = "pending";
          // Otherwise, if there is a disallowed reason as well, mark it as that reason
          else if (this.disallowedReason) u.nameStatus = this.disallowedReason;
          //
        }),
        switchMap(u => api.update(u, this.disallowedName))
        // todo handle errors
      )
    ], asyncScheduler).pipe(
      mergeAll()
    );

    this.ctx$ = combineLatest([
      currentUser$,
      sponsorSvc.list('')
    ]).pipe(
      map(([user, sponsors]) => ({user, sponsors})),
      tap((us) => {
        if (us.user.nameStatus && us.user.nameStatus != 'pending') {
          if (this.disallowedName == null) {
            this.disallowedName = us.user.name;
            this.disallowedReason = us.user.nameStatus;
          }
        }
      })
    );
  }

  ngOnInit(): void {
  }

  setSponsor(u: ApiUser, s: Sponsor): void {
    this.updating$.next({...u, sponsor: s.logo});
  }

  refresh(u: ApiUser): void {
    this.userSvc.refresh();
  }
}
