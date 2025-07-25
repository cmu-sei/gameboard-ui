import { CoreModule } from '@/core/core.module';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-practice-content',
  imports: [RouterOutlet, CoreModule],
  templateUrl: './practice-content.component.html',
  styleUrl: './practice-content.component.scss'
})
export class PracticeContentComponent {
}
