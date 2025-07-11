import { Component } from '@angular/core';
import { PlayerMode } from '@/api/player-models';
import { ObserveViewComponent } from '@/admin/components/observe-view/observe-view.component';

@Component({
  selector: 'app-practice-observe',
  imports: [ObserveViewComponent],
  templateUrl: './practice-observe.component.html',
  styleUrl: './practice-observe.component.scss'
})
export class PracticeObserveComponent {
  protected observePlayerMode = PlayerMode.practice;
}
