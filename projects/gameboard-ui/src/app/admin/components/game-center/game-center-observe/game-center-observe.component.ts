import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConsolesService } from '@/api/consoles.service';
import { ListConsolesResponseConsole } from '@/api/consoles.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ConsoleComponentConfig } from '@cmusei/console-forge';

@Component({
  selector: 'app-game-center-observe',
  templateUrl: './game-center-observe.component.html',
  styleUrl: "./game-center-observe.component.scss",
  standalone: false
})
export class GameCenterObserveComponent {
  private readonly consolesService = inject(ConsolesService);
  private readonly route = inject(ActivatedRoute);

  protected readonly consoles = signal<ConsoleComponentConfig[]>([]);
  protected gameId = toSignal(this.route.data.pipe(map(d => d.gameId)));
  protected observeBy: "challenge" | "team" = "challenge";

  constructor(
    route$: ActivatedRoute,
    unsub: UnsubscriberService) {

    unsub.add(route$.queryParams.subscribe(qp => this.observeBy = (qp.mode === "challenge") ? "challenge" : "team"));

    effect(() => {
      if (this.gameId()) {
        this.loadConsoles(this.gameId());
      }
    });
  }

  protected handleObserveByChangeRequest(observeBy: "challenge" | "team") {
    this.observeBy = observeBy;
  }

  private async loadConsoles(gameId: string): Promise<void> {
    const response = await this.consolesService.listConsoles({ gameId });
    this.consoles.update(() => response.consoles.map(c => ({
      autoFocusOnConnect: false,
      consoleClientType: "vnc",
      credentials: { accessTicket: c.accessTicket },
      url: c.url
    })));
  }
}
