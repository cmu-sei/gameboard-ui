// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, Observable, scheduled, Subject } from 'rxjs';
import { debounceTime, mergeAll, switchMap, tap } from 'rxjs/operators';
import { ApiUser, ChangedUser } from '../../../api/user-models';
import { UserService as ApiUserService } from '../../../api/user.service';
import { UserService } from '../../../utility/user.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  providers: [UnsubscriberService]
})
export class ProfileEditorComponent {
  currentUser$: Observable<ApiUser | null>;
  errors = [];

  private _doUpdate$ = new Subject<ChangedUser>();
  private _updated$: Observable<ApiUser>;

  faSync = faSyncAlt;
  disallowedName: string | null = null;
  disallowedReason: string | null = null;

  constructor(
    private api: ApiUserService,
    private userSvc: UserService,
    private unsub: UnsubscriberService,
  ) {

    this._updated$ = this._doUpdate$.pipe(
      debounceTime(500),
      switchMap(changedUser => this.api.update(changedUser, this.disallowedName))
    );

    this.unsub.add(this._updated$.subscribe());

    this.currentUser$ = scheduled([
      userSvc.user$,
      this._updated$
    ], asyncScheduler).pipe(
      mergeAll(),
      tap(user => {
        if (user?.nameStatus && user.nameStatus != "pending") {
          if (this.disallowedName == null) {
            this.disallowedName = user.name;
            this.disallowedReason = user.nameStatus;
          }
        }
      })
    );
  }

  async updateUserName(name: string): Promise<void> {
    if (!this.userSvc.user$.value)
      throw new Error("Can't update user name if not logged in.");

    if (!name)
      return;

    // set name status in response
    let nameStatus = "";
    // If the user's name isn't the disallowed one, mark it as pending
    if (name != this.disallowedName) nameStatus = "pending";
    // Otherwise, if there is a disallowed reason as well, mark it as that reason
    else if (this.disallowedReason) nameStatus = this.disallowedReason;

    this._doUpdate$.next({
      id: this.userSvc.user$.value.id,
      name,
      nameStatus
    });
  }

  refresh(): void {
    this.userSvc.refresh();
  }
}
