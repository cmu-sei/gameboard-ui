import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CoreModule } from '../core/core.module';
import { ChallengeAttemptSummaryComponent } from './components/challenge-attempt-summary/challenge-attempt-summary.component';
import { ChallengeDetailModalComponent } from './components/reports/practice-mode-report/challenge-detail-modal/challenge-detail-modal.component';
import { ChallengeOrGameFieldComponent } from './components/challenge-or-game-field/challenge-or-game-field.component';
import { ChallengesReportComponent } from './components/reports/challenges-report/challenges-report.component';
import { ChallengesReportSummaryToStatsPipe } from './components/reports/challenges-report/challenges-report-summary-to-stats.pipe';
import { EnrollmentReportByGameComponent } from './components/reports/enrollment-report/enrollment-report-by-game/enrollment-report-by-game.component';
import { EnrollmentReportSponsorPlayerCountModalComponent } from './components/reports/enrollment-report/enrollment-report-sponsor-player-count-modal/enrollment-report-sponsor-player-count-modal.component';
import { EnrollmentReportSummaryComponent } from './components/reports/enrollment-report/enrollment-report-summary/enrollment-report-summary.component';
import { EnrollmentReportTrendComponent } from './components/reports/enrollment-report/enrollment-report-trend/enrollment-report-trend.component';
import { NoReportRecordsComponent } from './components/no-report-records/no-report-records.component';
import { ParameterChangeLinkComponent } from './components/parameter-change-link/parameter-change-link.component';
import { ParameterDateRangeComponent } from './components/parameters/parameter-date-range/parameter-date-range.component';
import { ParameterGameChallengespecComponent } from './components/parameters/parameter-game-challengespec/parameter-game-challengespec.component';
import { ParameterSponsorComponent } from './components/parameters/parameter-sponsor/parameter-sponsor.component';
import { ParameterTicketStatusComponent } from './components/parameters/parameter-ticket-status/parameter-ticket-status.component';
import { ParameterTimespanPickerComponent } from './components/parameters/parameter-timespan-picker/parameter-timespan-picker.component';
import { PlayerFieldComponent } from './components/player-field/player-field.component';
import { PlayersReportComponent } from './components/reports/players-report/players-report.component';
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
import { CountToTooltipClassPipe } from './pipes/count-to-tooltip-class.pipe';
import { PlayerChallengeAttemptsModalComponent } from './components/player-challenge-attempts-modal/player-challenge-attempts-modal.component';
import { PlayersReportSummaryToStatsPipe } from './components/reports/players-report/players-report-summary-to-stats.pipe';
import { PlayersReportParticipationSummaryComponent } from './components/players-report-participation-summary/players-report-participation-summary.component';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ToSupportReportStatsPipe } from './components/reports/support-report/to-support-report-stats.pipe';
import { SiteUsageReportComponent } from './components/reports/site-usage-report/site-usage-report.component';
import { SiteUsagePlayerListComponent } from './components/reports/site-usage-report/site-usage-player-list/site-usage-player-list.component';
import { SiteUsageReportSponsorsModalComponent } from './components/reports/site-usage-report/site-usage-report-sponsors-modal/site-usage-report-sponsors-modal.component';
import { SiteUsageReportChallengesListComponent } from './components/reports/site-usage-report/site-usage-report-challenges-list/site-usage-report-challenges-list.component';
import { SortHeaderComponent } from './components/sort-header/sort-header.component';
import { SpecQuestionPerformanceModalComponent } from './components/spec-question-performance-modal/spec-question-performance-modal.component';
import { FeedbackGameReportComponent } from './components/reports/feedback-game-report/feedback-game-report.component';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';

@NgModule({
  declarations: [
    ArrayFieldToClassPipe,
    CountToTooltipClassPipe,
    ChallengeAttemptSummaryComponent,
    ChallengeDetailModalComponent,
    ChallengesReportComponent,
    ChallengesReportSummaryToStatsPipe,
    EnrollmentReportComponent,
    EnrollmentReportByGameComponent,
    EnrollmentReportSponsorPlayerCountModalComponent,
    EnrollmentReportSummaryComponent,
    EnrollmentReportTrendComponent,
    FeedbackGameReportComponent,
    ParameterGameChallengespecComponent,
    ParameterDateRangeComponent,
    ParameterTicketStatusComponent,
    ParameterTimespanPickerComponent,
    PlayersReportComponent,
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
    SiteUsageReportComponent,
    SponsorChallengePerformanceComponent,
    PlayerFieldComponent,
    PlayerModePerformanceSummaryComponent,
    ReportStatSummaryComponent,
    PlayerChallengeAttemptsModalComponent,
    ParameterSponsorComponent,
    PlayersReportSummaryToStatsPipe,
    PlayersReportParticipationSummaryComponent,
    ToSupportReportStatsPipe,
    SiteUsagePlayerListComponent,
    SiteUsageReportSponsorsModalComponent,
    SiteUsageReportChallengesListComponent,
    SortHeaderComponent,
    SpecQuestionPerformanceModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ReportsHomeComponent, title: "Reports" },
      {
        path: '',
        component: ReportPageComponent,
        children: [
          { path: 'challenges', component: ChallengesReportComponent, title: "Challenges Report" },
          { path: 'enrollment', component: EnrollmentReportComponent, title: "Enrollment Report" },
          { path: 'feedback', component: FeedbackGameReportComponent, title: "Feedback Report" },
          { path: 'practice-area', component: PracticeModeReportComponent, title: "Practice Area Report" },
          { path: 'players', component: PlayersReportComponent, title: "Players Report" },
          { path: 'site-usage', component: SiteUsageReportComponent, title: "Site Usage Report" },
          { path: 'support', component: SupportReportComponent, title: "Support Report" }
        ]
      }
    ]),
    FontAwesomeModule,
    CoreModule,

    // standalones,
    ErrorDivComponent,
    SpinnerComponent
  ],
  providers: [UnsubscriberService]
})
export class ReportsModule { }
