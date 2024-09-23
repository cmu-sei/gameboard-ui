// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { AuthService, AuthTokenState } from '@/utility/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  protected authority: string | undefined;
  protected fa = fa;
  working = false;

  constructor(
    private auth: AuthService) {
    this.authority = auth.authority;
  }

  login(): void {
    this.working = true;
    this.auth.externalLogin(this.auth.redirectUrl);
  }
}
