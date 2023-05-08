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
import { ParameterCompetitionComponent } from './components/parameters/parameter-competition/parameter-competition.component';
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
    ParameterCompetitionComponent,
    ParameterTrackComponent,
    ParameterGameComponent,
    CountFieldToClassPipe,
    StringsToTooltipPipe,
    ParameterChallengeSpecComponent,
    ShareButtonComponent,
    SupportReportComponent,
    ParameterNumberComponent,
    ParameterDateRangeComponent,
    ParameterTicketLabelsComponent,
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
