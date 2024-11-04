// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { debounceTime, Observable, Subject } from 'rxjs';
import { ApiUser } from '@/api/user-models';
import { UserService } from '@/api/user.service';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ConfigService } from '@/utility/config.service';
import { SettingsService } from '@/api/settings.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss'],
  providers: [UnsubscriberService]
})
export class ProfileEditorComponent implements OnInit {
  protected appName = this.config.appName;
  protected changeNameInput$ = new Subject<string>();
  protected currentUser$: Observable<ApiUser | null>;
  protected errors = [];
  protected fa = fa;
  protected disallowedName: string | null = null;
  protected disallowedReason: string | null = null;
  protected nameChangeEnabled = true;

  constructor(
    private api: UserService,
    private config: ConfigService,
    private localUser: LocalUserService,
    private settings: SettingsService,
    private unsub: UnsubscriberService,
  ) {

    this.currentUser$ = this.localUser.user$;
    this.unsub.add(this.api.nameChanged$.subscribe(change => {
      this.localUser.refresh();
      this.bindUserNameState(this.localUser.user$.value);
    }));
    this.unsub.add(this.changeNameInput$.pipe(debounceTime(500)).subscribe(async newName => await this.handleNameUpdate(newName)));
  }

  async ngOnInit() {
    const gameboardSettings = await this.settings.get();
    this.nameChangeEnabled = gameboardSettings.nameChangeIsEnabled;
  }

  protected async handleNameUpdate(name: string): Promise<void> {
    if (!this.localUser.user$.value)
      throw new Error("Can't update user name if not logged in.");

    if (!name)
      return;

    await this.api.requestNameChange(this.localUser.user$.value.id, { requestedName: name });
  }

  protected handleRefresh() {
    this.localUser.refresh();
  }

  private bindUserNameState(user: ApiUser | null) {
    if (user?.nameStatus && user.nameStatus != "pending") {
      if (this.disallowedName == null) {
        this.disallowedName = user.name;
        this.disallowedReason = user.nameStatus;
      }
    }
  }
}
