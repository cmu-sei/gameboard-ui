// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { FeedbackReportRecord } from '../feedback-report.models';

@Component({
    selector: 'app-player-feedback-responses-modal',
    templateUrl: './player-feedback-responses-modal.component.html',
    styleUrls: ['./player-feedback-responses-modal.component.scss'],
    standalone: false
})
export class PlayerFeedbackResponsesModalComponent {
  record?: FeedbackReportRecord;
  templateId?: string;
}
