import { TicketSummary } from '@/api/support-models';
import { SupportService } from '@/api/support.service';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game-center-tickets',
  templateUrl: './game-center-tickets.component.html',
  styleUrls: ['./game-center-tickets.component.scss']
})
export class GameCenterTicketsComponent implements OnChanges {
  @Input() gameId!: string;

  protected isLoading = false;
  protected tickets: TicketSummary[] = [];

  constructor(private supportService: SupportService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.isLoading = true;
    this.tickets = await firstValueFrom(this.supportService.list({ orderItem: 'key', gameId: this.gameId }));
    this.isLoading = false;
  }
}
