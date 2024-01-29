import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateTime, Duration } from 'luxon';

@Component({
  selector: 'app-late-start-banner',
  templateUrl: './late-start-banner.component.html',
  styleUrls: ['./late-start-banner.component.scss']
})
export class LateStartBannerComponent implements OnChanges {
  @Input() gameAllowsLateStart?: boolean;
  @Input() gameEnd?: Date;
  @Input() sessionLengthMinutes?: number;

  protected actualSessionTimeDescription?: string;
  protected gameEndDateTime?: DateTime;
  protected gameEndDateDescription?: string;
  protected normalSessionLengthDescription?: string;
  protected showWarning = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.gameEndDateTime = this.gameEnd ? DateTime.fromJSDate(this.gameEnd) : undefined;
    this.gameEndDateDescription = this.gameEnd ? this.gameEndDateTime!.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS) : undefined;
    this.actualSessionTimeDescription = this.gameEnd ? this.gameEndDateTime!.diffNow().rescale().toHuman() : undefined;
    this.normalSessionLengthDescription = this.sessionLengthMinutes ? Duration.fromDurationLike({ minutes: this.sessionLengthMinutes }).rescale().toHuman() : undefined;

    this.showWarning = (
      !!this.gameAllowsLateStart &&
      !!this.sessionLengthMinutes &&
      !!this.gameEndDateTime &&
      this.gameEndDateTime > DateTime.now() &&
      DateTime.now().plus({ minutes: this.sessionLengthMinutes }) > this.gameEndDateTime
    );
  }
}
