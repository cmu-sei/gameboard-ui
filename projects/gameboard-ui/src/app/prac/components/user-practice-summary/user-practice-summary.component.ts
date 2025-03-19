import { CoreModule } from '@/core/core.module';
import { TextToHexColorPipe } from '@/core/pipes/text-to-hex-color.pipe';
import { UserPracticeSummary } from '@/prac/practice.models';
import { PracticeService } from '@/services/practice.service';
import { Component, inject, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-practice-summary',
  standalone: true,
  templateUrl: './user-practice-summary.component.html',
  styleUrl: './user-practice-summary.component.scss',
  imports: [
    CoreModule,
    TextToHexColorPipe
  ],
})
export class UserPracticeSummaryComponent implements OnInit {
  userId = input.required<string>();

  private practiceService = inject(PracticeService);

  protected userSummary?: UserPracticeSummary;

  async ngOnInit() {
    this.userSummary = await this.practiceService.getUserPracticeSummary(this.userId());
  }
}
