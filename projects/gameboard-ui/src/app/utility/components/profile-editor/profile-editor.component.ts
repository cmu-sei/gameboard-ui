// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, Observable, scheduled, Subject } from 'rxjs';
import { mergeAll, tap } from 'rxjs/operators';
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
export class ProfileEditorComponent {
  currentUser$: Observable<ApiUser | null>;
  sponsors$: Observable<Sponsor[]>;
  updating$ = new Subject<ApiUser>();
  errors = [];

  faSync = faSyncAlt;

  disallowedName: string | null = null;
  disallowedReason: string | null = null;

  constructor (
    private api: ApiUserService,
    private userSvc: UserService,
    sponsorSvc: SponsorService
  ) {
    this.sponsors$ = sponsorSvc.list('');

    this.currentUser$ = scheduled([
      userSvc.user$,
      this.updating$
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

    this.userSvc.refresh();
  }

  async updateUser(u: ApiUser | null, sponsorLogo: string): Promise<void> {
    if (!u) {
      throw new Error("Can't access user to update sponsor.");
    }

    if (sponsorLogo) {
      u.sponsor = sponsorLogo;
    }

    // If the user's name isn't the disallowed one, mark it as pending
    if (u.name != this.disallowedName) u.nameStatus = "pending";
    // Otherwise, if there is a disallowed reason as well, mark it as that reason
    else if (this.disallowedReason) u.nameStatus = this.disallowedReason;

    // update the api
    const updatedUser = await this.api.update(u, this.disallowedName).toPromise();
    this.updating$.next(updatedUser);
  }

  refresh(u: ApiUser): void {
    this.userSvc.refresh();
  }
}
