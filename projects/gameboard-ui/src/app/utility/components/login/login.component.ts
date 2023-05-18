// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faOpenid } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  authority: string | undefined;
  faOpenid = faOpenid;
  working = false;

  constructor(
    private auth: AuthService,
  ) {
    this.authority = auth.authority;
  }

  login(): void {
    this.working = true;
    this.auth.externalLogin(this.auth.redirectUrl);
  }

}
