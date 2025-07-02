import { Component, inject, OnInit, signal } from '@angular/core';
import { ConsolesService } from '@/api/consoles.service';
import { PlayerMode } from '@/api/player-models';
import { groupBy } from 'projects/gameboard-ui/src/tools/tools';
import { ListConsolesResponseConsole } from '@/api/consoles.models';
import { ObserveViewComponent } from '@/admin/components/observe-view/observe-view.component';

@Component({
  selector: 'app-practice-observe',
  imports: [ObserveViewComponent],
  templateUrl: './practice-observe.component.html',
  styleUrl: './practice-observe.component.scss'
})
export class PracticeObserveComponent implements OnInit {
  private readonly consolesService = inject(ConsolesService);
  private readonly teamsPlaying = signal(new Map<string, ListConsolesResponseConsole[]>());

  protected observePlayerMode = PlayerMode.practice;

  async ngOnInit(): Promise<void> {
    const response = await this.consolesService.listConsoles({ playerMode: PlayerMode.practice });
    this.teamsPlaying.update(() => groupBy(response.consoles, c => c.team.id));
    const grouped = groupBy(response.consoles, c => c.team.id);
  }
}
