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
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { TicketStatusBadgePipe } from './pipes/ticket-status-badge.pipe';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { markedOptionsFactory } from './config/marked.config';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RelativeImagePipe } from './pipes/relative-image.pipe';
import { SelectPagerComponent } from './components/select-pager/select-pager.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';

// import luxon adapter for chartjs
import 'chartjs-adapter-luxon';

const PUBLIC_DECLARATIONS = [
  ColoredTextChipComponent,
  DoughnutChartComponent,
  LineChartComponent,
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  MultiSelectComponent,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  RenderLinksInTextComponent,
  RelativeImagePipe,
  RelativeUrlsPipe,
  SelectPagerComponent,
  SpinnerComponent,
  TextToColorPipe,
  TicketStatusBadgePipe,
  UrlRewritePipe,
  YamlBlockComponent,
  YamlPipe
];

const RELAYED_MODULES = [
  BsDropdownModule,
  FontAwesomeModule,
  FormsModule,
  BsDatepickerModule,
  NgChartsModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule,
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS
  ],
  imports: [
    CommonModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    ...RELAYED_MODULES
  ],
  exports: [
    ...RELAYED_MODULES,
    ...PUBLIC_DECLARATIONS,
    MarkdownModule
  ]
})
export class CoreModule { }
