// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { UserHubService } from '@/services/signalR/user-hub.service';
import { UserHubAnnouncement } from '@/services/signalR/user-hub.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    MarkdownModule,
  ],
  styleUrls: ['./message-board.component.scss'],
  template: `
  <div *ngIf="list?.length" class="message-div">
  <div *ngFor="let a of list" tabindex="0" class="pop-warning m-2">
    <div class="text-right m-1">
      <button class="btn btn-outline-warning" (click)="dismiss(a)">
        <fa-icon [icon]="fa.xMark"></fa-icon>
        <span>Dismiss</span>
      </button>
    </div>
    <div class="p-4" [innerHTML]="a.contentMarkdown | markdown | async"></div>
  </div>
</div>

`,
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
