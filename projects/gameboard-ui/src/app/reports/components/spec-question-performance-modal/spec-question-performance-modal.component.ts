import { GetChallengeSpecQuestionPerformanceResult } from '@/api/spec-models';
import { SpecService } from '@/api/spec.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-spec-question-performance-modal',
  templateUrl: './spec-question-performance-modal.component.html',
  styleUrls: ['./spec-question-performance-modal.component.scss']
})
export class SpecQuestionPerformanceModalComponent implements OnInit {
  specId?: string;
  protected context?: GetChallengeSpecQuestionPerformanceResult;

  constructor(private specService: SpecService) { }

  async ngOnInit() {
    if (!this.specId)
      throw new Error("Requires a spec.");

    this.context = await this.specService.getQuestionPerformance(this.specId);
  }
}
