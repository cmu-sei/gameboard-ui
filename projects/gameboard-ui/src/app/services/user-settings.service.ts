import { UserAppSettings } from "@/users/users.models";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
    public updated$ = new BehaviorSubject<UserAppSettings>({ useStickyChallengePanel: false });
}
