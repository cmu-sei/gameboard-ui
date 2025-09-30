// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { UserAppSettings } from "@/users/users.models";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
    public updated$ = new BehaviorSubject<UserAppSettings>({ useStickyChallengePanel: false });
}
