import { ConfigService } from '@/utility/config.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {
  protected appName: string;

  constructor(config: ConfigService) {
    this.appName = config.settings.appname || "Gameboard";
  }
}
