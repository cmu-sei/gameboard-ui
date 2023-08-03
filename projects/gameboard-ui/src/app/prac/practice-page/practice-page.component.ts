import { Component } from '@angular/core';
import { ConfigService } from '@/utility/config.service';
import { UserService as LocalUserService } from '@/utility/user.service';

@Component({
  selector: 'app-practice-page',
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.scss']
})
export class PracticePageComponent {
  protected appName?: string;
  protected localUserId?: string;

  constructor(
    configService: ConfigService,
    localUser: LocalUserService) {
    this.appName = configService.settings.appname || "Gameboard";
    this.localUserId = localUser.user$.getValue()?.id;
  }
}
