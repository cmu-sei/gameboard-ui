import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgChartsModule } from 'ng2-charts';

import { ColoredTextChipComponent } from './components/colored-text-chip/colored-text-chip.component';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { LinkifyHtmlPipe } from './pipes/linkify-html.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { TicketStatusBadgePipe } from './pipes/ticket-status-badge.pipe';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';

const PUBLIC_DECLARATIONS = [
  ColoredTextChipComponent,
  DoughnutChartComponent,
  LinkifyHtmlPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  RelativeUrlsPipe,
  SafeHtmlPipe,
  SpinnerComponent,
  TextToColorPipe,
  TicketStatusBadgePipe,
  UrlRewritePipe,
  YamlBlockComponent,
  YamlPipe
];

const RELAYED_MODULES = [
  FontAwesomeModule,
  FormsModule,
  BsDatepickerModule,
  NgChartsModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule,
]

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
  ],
  imports: [
    CommonModule,
    ...RELAYED_MODULES
  ],
  exports: [
    ...RELAYED_MODULES,
    ...PUBLIC_DECLARATIONS,
  ]
})
export class CoreModule { }
