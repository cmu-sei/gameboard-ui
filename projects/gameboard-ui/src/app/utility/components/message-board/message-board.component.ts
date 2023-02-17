// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Announcement } from '../../../api/user-models';
import { HubEvent, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.scss']
})
export class MessageBoardComponent implements OnInit {

  feed$: Observable<HubEvent>;
  list: Announcement[] = [];
  faClose = faTimes;

  constructor(
    hub: NotificationService
  ) {
    this.feed$ = hub.announcements.pipe(
      tap(e => this.list.push(e.model as Announcement))
    );
  }

  ngOnInit(): void {
  }

  dismiss(a: Announcement): void {
    this.list.splice(
      this.list.indexOf(a),
      1
    );
  }
}
