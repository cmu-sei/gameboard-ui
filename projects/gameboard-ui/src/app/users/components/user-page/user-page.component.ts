import { Component } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { Observable, map } from 'rxjs';
import { UserRole } from '@/api/user-models';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {
  protected appName: string;
  protected canUseSettings$: Observable<boolean>;

  constructor(
    config: ConfigService,
    localUser: LocalUserService) {
    this.appName = config.settings.appname || "Gameboard";
    this.canUseSettings$ = localUser.user$.pipe(
      map(u => {
        if (!u)
          return false;

        return u.isAdmin || u.isSupport;
      })
    );
  }
}
