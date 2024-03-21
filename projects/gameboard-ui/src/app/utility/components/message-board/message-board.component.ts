// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { UserHubService } from '@/services/signalR/user-hub.service';
import { UserHubAnnouncement } from '@/services/signalR/user-hub.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss'],
  providers: [UnsubscriberService]
})
export class MessageBoardComponent {
  protected list: UserHubAnnouncement[] = [];
  protected fa = fa;

  constructor(
    unsub: UnsubscriberService,
    userHub: UserHubService) {

    unsub.add(userHub.announcements$.subscribe(announcement => this.list.push(announcement)));
  }

  dismiss(a: UserHubAnnouncement): void {
    this.list = [...this.list.filter(item => item !== a)];
  }
}
