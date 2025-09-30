// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, map, timer } from 'rxjs';

@Component({
    selector: 'app-challenge-deploy-countdown',
    imports: [
        CommonModule,
        SpinnerComponent
    ],
    template: `
    <app-spinner textPosition="bottom">
      <ng-container>
        <div *ngIf="((estimatedTimeRemaining$ | async) || 0) > 0; else timeUp" class="time-remaining d-flex justify-content-center fs-15">
          <label class="d-block mr-2">Estimated time remaining: </label>
          <span class="d-block value">{{ estimatedTimeRemaining$ | async }}</span>
        </div>
      </ng-container>

      <ng-template #timeUp><div class="fs-15">Finishing up...</div></ng-template>
    </app-spinner>
  `,
    styles: [
        "label { text-transform: uppercase; color: #bebebe; font-weight: light; }",
        ".value { font-weight: bold; }"
    ]
})
export class ChallengeDeployCountdownComponent implements OnChanges {
  @Input() deploySeconds: number = 0;

  estimatedTimeRemaining$?: Observable<number>;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.deploySeconds)
      return;

    this.estimatedTimeRemaining$ = timer(0, 1000).pipe(map(tick => (this.deploySeconds - Math.floor((1000 * tick) / 1000))));
  }
}
