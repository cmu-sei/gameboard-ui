import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CoreModule } from '../core/core.module';
import { ChallengeAttemptSummaryComponent } from './components/challenge-attempt-summary/challenge-attempt-summary.component';
import { ChallengeOrGameFieldComponent } from './components/challenge-or-game-field/challenge-or-game-field.component';
import { NoReportRecordsComponent } from './components/no-report-records/no-report-records.component';
import { ParameterChangeLinkComponent } from './components/parameter-change-link/parameter-change-link.component';
import { ParameterChallengeSpecComponent } from './components/parameters/parameter-challenge-spec/parameter-challenge-spec.component';
import { ParameterDateRangeComponent } from './components/parameters/parameter-date-range/parameter-date-range.component';
import { ParameterGameChallengespecComponent } from './components/parameters/parameter-game-challengespec/parameter-game-challengespec.component';
import { ParameterSeriesComponent } from './components/parameters/parameter-series/parameter-series.component';
import { ParameterTicketLabelsComponent } from './components/parameters/parameter-ticket-labels/parameter-ticket-labels.component';
import { ParameterTicketStatusComponent } from './components/parameters/parameter-ticket-status/parameter-ticket-status.component';
import { ParameterTimespanPickerComponent } from './components/parameters/parameter-timespan-picker/parameter-timespan-picker.component';
import { PlayerFieldComponent } from './components/player-field/player-field.component';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { ReportFieldNoValueComponent } from './components/report-field-no-value/report-field-no-value.component';
import { ReportGlobalControlsComponent } from './components/report-global-controls/report-global-controls.component';
import { ReportParametersContainerComponent } from './components/report-parameters-container/report-parameters-container.component';
import { ReportSelectComponent } from './components/report-select/report-select.component';
import { ReportStatSummaryComponent } from './components/report-stat-summary/report-stat-summary.component';
import { ReportsHomeComponent } from './components/reports-home/reports-home.component';
import { EnrollmentReportComponent } from './components/reports/enrollment-report/enrollment-report.component';
import { PlayerModePerformanceSummaryComponent } from './components/reports/practice-mode-report/player-mode-performance-summary/player-mode-performance-summary.component';
import { PracticeModeReportByChallengeComponent } from './components/reports/practice-mode-report/practice-mode-report-by-challenge/practice-mode-report-by-challenge.component';
import { PracticeModeReportByPlayerModePerformanceComponent } from './components/reports/practice-mode-report/practice-mode-report-by-player-mode-performance/practice-mode-report-by-player-mode-performance.component';
import { PracticeModeReportByUserComponent } from './components/reports/practice-mode-report/practice-mode-report-by-user/practice-mode-report-by-user.component';
import { PracticeModeReportComponent } from './components/reports/practice-mode-report/practice-mode-report.component';
import { SponsorChallengePerformanceComponent } from './components/reports/practice-mode-report/sponsor-challenge-performance/sponsor-challenge-performance.component';
import { SupportReportContextMenuComponent } from './components/reports/support-report-context-menu/support-report-context-menu.component';
import { SupportReportComponent } from './components/reports/support-report/support-report.component';
import { ReportPageComponent } from './pages/report-page/report-page.component';
import { ArrayFieldToClassPipe } from './pipes/array-field-to-class.pipe';
import { ArrayToCountPipe } from './pipes/array-to-count.pipe';
import { ChallengeResultColorPipe } from './pipes/challenge-result-color.pipe';
import { ChallengeResultPrettyPipe } from './pipes/challenge-result-pretty.pipe';
import { CountToTooltipClassPipe } from './pipes/count-to-tooltip-class.pipe';
import { MsToDurationPipe } from './pipes/ms-to-duration.pipe';
import { PlayerChallengeAttemptsModalComponent } from './components/player-challenge-attempts-modal/player-challenge-attempts-modal.component';

@NgModule({
  declarations: [
    ArrayToCountPipe,
    ArrayFieldToClassPipe,
    ChallengeResultColorPipe,
    ChallengeResultPrettyPipe,
    CountToTooltipClassPipe,
    ChallengeAttemptSummaryComponent,
    EnrollmentReportComponent,
    ParameterChallengeSpecComponent,
    MsToDurationPipe,
    ParameterGameChallengespecComponent,
    ParameterDateRangeComponent,
    ParameterSeriesComponent,
    ParameterTicketLabelsComponent,
    ParameterTicketStatusComponent,
    ParameterTimespanPickerComponent,
    ReportCardComponent,
    ParameterChangeLinkComponent,
    ReportGlobalControlsComponent,
    ReportPageComponent,
    ReportParametersContainerComponent,
    ReportSelectComponent,
    ReportsHomeComponent,
    SupportReportComponent,
    SupportReportContextMenuComponent,
    PracticeModeReportComponent,
    PracticeModeReportByUserComponent,
    PracticeModeReportByChallengeComponent,
    NoReportRecordsComponent,
    ReportFieldNoValueComponent,
    ChallengeOrGameFieldComponent,
    PracticeModeReportByPlayerModePerformanceComponent,
    SponsorChallengePerformanceComponent,
    PlayerFieldComponent,
    PlayerModePerformanceSummaryComponent,
    ReportStatSummaryComponent,
    PlayerChallengeAttemptsModalComponent,
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
          { path: 'practice-area', component: PracticeModeReportComponent, title: "Practice Area Report" },
          { path: 'support', component: SupportReportComponent, title: "Support Report" }
        ]
      }
    ]),
    FontAwesomeModule,
    CoreModule,
  ]
})
export class ReportsModule { }
