// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faOpenid } from '@fortawesome/free-brands-svg-icons';
import { AuthService, AuthTokenState } from '@/utility/auth.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UnsubscriberService]
})
export class LoginComponent {
  authority: string | undefined;
  faOpenid = faOpenid;
  working = false;

  constructor(
    private auth: AuthService,
    private routerService: RouterService,
    private unsub: UnsubscriberService) {
    this.authority = auth.authority;
    this.unsub.add(this.auth.tokenState$.subscribe(state => {
      if (state == AuthTokenState.valid) {
        this.routerService.goHome();
      }
    }));
  }

  login(): void {
    this.working = true;
    this.auth.externalLogin(this.auth.redirectUrl);
  }
}
