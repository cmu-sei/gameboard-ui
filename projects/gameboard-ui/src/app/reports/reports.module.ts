import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipationReportComponent } from './components/participation-report/participation-report.component';
import { ReportsHomeComponent } from './components/reports-home/reports-home.component';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { CoreModule } from '../core/core.module';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { ReportsLayoutComponent } from './components/reports-layout/reports-layout.component';
import { ReportParametersComponent } from './components/report-parameters/report-parameters.component';
import { ReportDynamicComponent } from './components/report-dynamic/report-dynamic.component';
import { DateRangeComponent } from './components/date-range/date-range.component';
import { ChallengesReportComponent } from './components/challenges-report/challenges-report.component';
import { DynamicReportDirective } from './directives/dynamic-report.directive';
import { UtilityModule } from '../utility/utility.module';
import { MsToDurationPipe } from './pipes/ms-to-duration.pipe';
import { CompetitionSelectComponent } from './components/competition-select/competition-select.component';

@NgModule({
  declarations: [
    ParticipationReportComponent,
    ReportsHomeComponent,
    ReportCardComponent,
    ReportsLayoutComponent,
    ReportParametersComponent,
    ReportDynamicComponent,
    DateRangeComponent,
    ChallengesReportComponent,
    DynamicReportDirective,
    MsToDurationPipe,
    CompetitionSelectComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReportsLayoutComponent,
        children: [
          { path: ':reportSlug', component: ReportDynamicComponent },
          { path: '', pathMatch: 'full', component: ReportsHomeComponent, title: "Reports" }
        ]
      }
    ]),
    NgChartsModule,
    CoreModule,
    UtilityModule
  ],
  exports: [
    DynamicReportDirective
  ]
})
export class ReportsModule { }
