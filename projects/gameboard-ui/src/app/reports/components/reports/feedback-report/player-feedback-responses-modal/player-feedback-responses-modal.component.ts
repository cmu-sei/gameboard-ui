import { Component } from '@angular/core';
import { FeedbackReportRecord } from '../feedback-report.models';

@Component({
  selector: 'app-player-feedback-responses-modal',
  templateUrl: './player-feedback-responses-modal.component.html',
  styleUrls: ['./player-feedback-responses-modal.component.scss']
})
export class PlayerFeedbackResponsesModalComponent {
  record?: FeedbackReportRecord;
  templateId?: string;
}
