import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsHomeComponent } from './components/reports-home/reports-home.component';
import { RouterModule, TitleStrategy } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CoreModule } from '../core/core.module';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { ChallengesReportComponent } from './components/reports/challenges-report/challenges-report.component';
import { UtilityModule } from '../utility/utility.module';
import { MsToDurationPipe } from './pipes/ms-to-duration.pipe';
import { PlayersReportComponent } from './components/reports/players-report/players-report.component';
import { ReportParametersContainerComponent } from './components/report-parameters-container/report-parameters-container.component';
import { ParameterSeriesComponent } from './components/parameters/parameter-series/parameter-series.component';
import { ParameterTrackComponent } from './components/parameters/parameter-track/parameter-track.component';
import { ParameterGameComponent } from './components/parameters/parameter-game/parameter-game.component';
import { ArrayFieldToClassPipe } from './pipes/array-field-to-class.pipe';
import { StringsToTooltipPipe } from './pipes/strings-to-tooltip.pipe';
import { ParameterChallengeSpecComponent } from './components/parameters/parameter-challenge-spec/parameter-challenge-spec.component';
import { ShareButtonComponent } from './components/share-button/share-button.component';
import { SupportReportComponent } from './components/reports/support-report/support-report.component';
import { ParameterNumberComponent } from './components/parameters/parameter-number/parameter-number.component';
import { ParameterDateRangeComponent } from './components/parameters/parameter-date-range/parameter-date-range.component';
import { ParameterTicketLabelsComponent } from './components/parameters/parameter-ticket-labels/parameter-ticket-labels.component';
import { ParameterTimespanPickerComponent } from './components/parameters/parameter-timespan-picker/parameter-timespan-picker.component';
import { ParameterTicketStatusComponent } from './components/parameters/parameter-ticket-status/parameter-ticket-status.component';
import { ReportSelectComponent } from './components/report-select/report-select.component';
import { ParameterGameChallengespecComponent } from './components/parameters/parameter-game-challengespec/parameter-game-challengespec.component';
import { SupportReportContextMenuComponent } from './components/reports/support-report-context-menu/support-report-context-menu.component';
import { ParameterSponsorComponent } from './components/parameters/parameter-sponsor/parameter-sponsor.component';
import { EnrollmentReportComponent } from './components/reports/enrollment-report/enrollment-report.component';
import { ArrayToCountPipe } from './pipes/array-to-count.pipe';
import { ReportPageComponent } from './pages/report-page/report-page.component';
import { ReportGlobalControlsComponent } from './components/report-global-controls/report-global-controls.component';
import { CountToTooltipClassPipe } from './pipes/count-to-tooltip-class.pipe';
import { ParameterChangeLinkComponent } from './components/parameter-change-link/parameter-change-link.component';

@NgModule({
  declarations: [
    ArrayFieldToClassPipe,
    ReportsHomeComponent,
    ReportCardComponent,
    ChallengesReportComponent,
    CountToTooltipClassPipe,
    MsToDurationPipe,
    PlayersReportComponent,
    ReportParametersContainerComponent,
    StringsToTooltipPipe,
    ParameterChallengeSpecComponent,
    ShareButtonComponent,
    SupportReportComponent,
    ParameterGameComponent,
    ParameterGameChallengespecComponent,
    ParameterNumberComponent,
    ParameterDateRangeComponent,
    ParameterSeriesComponent,
    ParameterTicketLabelsComponent,
    ParameterTicketStatusComponent,
    ParameterTimespanPickerComponent,
    ParameterTrackComponent,
    ReportSelectComponent,
    SupportReportContextMenuComponent,
    ParameterSponsorComponent,
    EnrollmentReportComponent,
    ArrayToCountPipe,
    ReportPageComponent,
    ReportGlobalControlsComponent,
    ParameterChangeLinkComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ReportsHomeComponent, title: "Reports" },
      {
        path: '',
        component: ReportPageComponent,
        children: [
          { path: 'enrollment', component: EnrollmentReportComponent, title: "Enrollment Report" },
          { path: 'support', component: SupportReportComponent, title: "Support Report" }
        ]
      }
    ]),
    FontAwesomeModule,
    CoreModule,
    UtilityModule,
  ]
})
export class ReportsModule { }
