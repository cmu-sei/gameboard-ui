// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { AuthService } from '../../utility/auth.service';
import { LogService } from '../../services/log.service';

@Component({
    selector: 'app-oidc',
    templateUrl: './oidc.component.html',
    styleUrls: ['./oidc.component.scss'],
    standalone: false
})
export class OidcComponent implements OnInit {
  private authService = inject(AuthService);
  private log = inject(LogService);
  private router = inject(Router);

  protected message = '';

  async ngOnInit() {
    try {
      const user = await this.authService.loginCallback();

      if (user) {
        this.log.logInfo("User authed", user);
      }

      const redirectToUrl = (user?.state as any)?.redirectTo?.toString();
      if (redirectToUrl) {
        timer(500).subscribe(() => {
          this.router.navigateByUrl(redirectToUrl);
        });
      }
    }
    catch (err) {
      const message = (err as any)?.message || err;
      this.log.logError("Error on OIDC callback:", message, err);
      this.message = message;
    }
  }
}
