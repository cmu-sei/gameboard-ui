import { Component } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { Observable, map } from 'rxjs';
import { ApiUser } from '@/api/user-models';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {
  protected appName: string;
  protected localUser$?: Observable<ApiUser>;

  constructor(
    config: ConfigService,
    localUser: LocalUserService) {
    this.appName = config.environment.settings.appname || "Gameboard";
  }
}
