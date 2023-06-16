import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsHomeComponent } from './components/reports-home/reports-home.component';
import { RouterModule, TitleStrategy } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CoreModule } from '../core/core.module';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { ReportsLayoutComponent } from './components/reports-layout/reports-layout.component';
import { ReportDynamicComponent } from './components/report-dynamic/report-dynamic.component';
import { ChallengesReportComponent } from './components/reports/challenges-report/challenges-report.component';
import { DynamicReportDirective } from './directives/dynamic-report.directive';
import { UtilityModule } from '../utility/utility.module';
import { MsToDurationPipe } from './pipes/ms-to-duration.pipe';
import { PlayersReportComponent } from './components/reports/players-report/players-report.component';
import { ReportParametersContainerComponent } from './components/report-parameters-container/report-parameters-container.component';
import { ParameterSeriesComponent } from './components/parameters/parameter-series/parameter-series.component';
import { ParameterTrackComponent } from './components/parameters/parameter-track/parameter-track.component';
import { ParameterGameComponent } from './components/parameters/parameter-game/parameter-game.component';
import { ReportsTitleResolver } from './resolvers/reports-title.resolver';
import { CountFieldToClassPipe } from './pipes/count-field-to-class.pipe';
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
import { ParameterSeriesMultiComponent } from './components/parameters/parameter-series-multi/parameter-series-multi.component';

@NgModule({
  declarations: [
    ReportsHomeComponent,
    ReportCardComponent,
    ReportsLayoutComponent,
    ReportDynamicComponent,
    ChallengesReportComponent,
    DynamicReportDirective,
    MsToDurationPipe,
    PlayersReportComponent,
    ReportParametersContainerComponent,
    CountFieldToClassPipe,
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
    ParameterSeriesMultiComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReportsLayoutComponent,
        children: [
          { path: ':reportKey', component: ReportDynamicComponent, title: ReportsTitleResolver },
          { path: '', pathMatch: 'full', component: ReportsHomeComponent, title: "Reports" }
        ]
      }
    ]),
    FontAwesomeModule,
    CoreModule,
    UtilityModule,
  ],
  exports: [
    DynamicReportDirective
  ]
})
export class ReportsModule { }
