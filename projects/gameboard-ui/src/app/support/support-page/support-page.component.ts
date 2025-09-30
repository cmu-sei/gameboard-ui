// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { filter, tap } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../utility/user.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { SupportSettings } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-support-page',
    templateUrl: './support-page.component.html',
    styleUrls: ['./support-page.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class SupportPageComponent implements OnInit {
  protected settings?: SupportSettings;

  constructor(
    private supportService: SupportService,
    private unsub: UnsubscriberService,
    hub: NotificationService,
    user: UserService
  ) {
    // join the hub to get ticket notifications
    this.unsub.add(
      user.user$.pipe(
        filter(u => !!u),
        tap(u => hub.init(u!.id))
      ).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    this.settings = await firstValueFrom(this.supportService.getSettings());
  }
}
