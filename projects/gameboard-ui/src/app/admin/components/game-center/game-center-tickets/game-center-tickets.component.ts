// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TicketSummary } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-center-tickets',
    templateUrl: './game-center-tickets.component.html',
    styleUrls: ['./game-center-tickets.component.scss'],
    standalone: false
})
export class GameCenterTicketsComponent {
  protected gameId?: string;
  protected isLoading = false;
  protected tickets: TicketSummary[] = [];

  constructor(
    route$: ActivatedRoute,
    private supportService: SupportService,
    private unsub: UnsubscriberService) {
    this.unsub.add(route$.data.subscribe(async d => await this.load(d.gameId)));
  }

  private async load(gameId?: string) {
    this.isLoading = true;
    this.gameId = gameId;
    this.tickets = await firstValueFrom(this.supportService.list({ orderItem: 'key', gameId: this.gameId }));
    this.isLoading = false;
  }
}
