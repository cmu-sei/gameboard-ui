import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateTime, Duration } from 'luxon';

@Component({
    selector: 'app-late-start-banner',
    templateUrl: './late-start-banner.component.html',
    styleUrls: ['./late-start-banner.component.scss'],
    standalone: false
})
export class LateStartBannerComponent implements OnChanges {
  @Input() gameAllowsLateStart?: boolean;
  @Input() gameEnd?: Date;
  @Input() sessionLengthMinutes?: number;

  protected gameEndDateTime?: DateTime;
  protected gameEndDateDescription?: string;
  protected isLate = false;
  protected normalSessionLengthDescription?: string;

  ngOnChanges(changes: SimpleChanges): void {
    this.gameEndDateTime = this.gameEnd ? DateTime.fromJSDate(this.gameEnd) : undefined;
    this.gameEndDateDescription = this.gameEnd ? this.gameEndDateTime!.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) : undefined;
    this.normalSessionLengthDescription = this.sessionLengthMinutes ? Duration.fromDurationLike({ minutes: this.sessionLengthMinutes }).rescale().toHuman() : undefined;

    this.isLate = (
      !!this.sessionLengthMinutes &&
      !!this.gameEndDateTime &&
      this.gameEndDateTime > DateTime.now() &&
      DateTime.now().plus({ minutes: this.sessionLengthMinutes }) > this.gameEndDateTime
    );
  }
}
