// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserService } from '@/utility/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-forbidden',
    templateUrl: './forbidden.component.html',
    styleUrls: ['./forbidden.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class ForbiddenComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private localUser: UserService,
    private router: Router,
    private unsub: UnsubscriberService) { }

  ngOnInit(): void {
    this.unsub.add(
      this.localUser.user$.subscribe(u => {
        if (u) {
          const requestedRoute = this.activatedRoute.snapshot.queryParamMap.get("requestedUrl");

          if (requestedRoute && !requestedRoute.includes("forbidden")) {
            // bit hacky, but we don't want an infinite redirect loop
            this.router.navigateByUrl(requestedRoute);
          }
        }
      })
    );
  }
}
