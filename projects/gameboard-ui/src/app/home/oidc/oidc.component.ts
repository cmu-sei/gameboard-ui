// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { AuthService } from '../../utility/auth.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-oidc',
  templateUrl: './oidc.component.html',
  styleUrls: ['./oidc.component.scss']
})
export class OidcComponent {
  message = '';

  constructor(
    auth: AuthService,
    log: LogService,
    router: Router
  ) {

    auth.externalLoginCallback().then(
      (user) => {
        timer(500).subscribe(() => {
          router.navigateByUrl("" + user.state || '/');
        });
      },
      (err) => {
        log.logError("Error on OIDC callback:", err);
        this.message = (err.error || err).message;
      }
    );
  }
}
