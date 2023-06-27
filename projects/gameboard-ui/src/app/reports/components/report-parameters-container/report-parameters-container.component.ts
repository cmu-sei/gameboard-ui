import { ActiveReportService } from '@/reports/services/active-report.service';
import { LogService } from '@/services/log.service';
import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-parameters-container',
  template: `<div class="report-parameters-component">
    <hr />
    <form #parametersForm="ngForm">
      <div class="parameters-container d-flex flex-wrap input-group-lg full-width">
          <ng-content></ng-content>
      </div>
    </form>
    <hr />
</div>

<ng-template #loading><app-spinner></app-spinner></ng-template>`,
  styleUrls: ['./report-parameters-container.component.scss']
})
export class ReportParametersContainerComponent implements AfterViewInit, OnDestroy {
  @Output() cleanChange = new EventEmitter<boolean>();
  @ViewChild('parametersForm') parametersForm?: NgForm;

  private _valueChangesSub?: Subscription;

  constructor(private activeReportService: ActiveReportService, private logService: LogService) { }

  ngAfterViewInit(): void {
    if (!this.parametersForm) {
      this.logService.logError("Couldn't resolve the report parameters form.");
      return;
    }

    this.parametersForm.valueChanges!.subscribe(changes => {
      this.activeReportService.parametersPristine = this.parametersForm?.pristine || true;
    });
  }

  ngOnDestroy(): void {
    this._valueChangesSub?.unsubscribe();
  }
}
