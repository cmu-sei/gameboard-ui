import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { NgChartsModule } from 'ng2-charts';
// import luxon adapter for chartjs
import 'chartjs-adapter-luxon';

import { ColoredTextChipComponent } from './components/colored-text-chip/colored-text-chip.component';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { SelectPagerComponent } from './components/select-pager/select-pager.component';
import { ShareButtonComponent } from './components/share-button/share-button.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { markedOptionsFactory } from './config/marked.config';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { QueryParamModelDirective } from './directives/query-param-model.directive';
import { AssetPathPipe } from './pipes/asset-path.pipe';
import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { RelativeImagePipe } from './pipes/relative-image.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { TicketStatusBadgePipe } from './pipes/ticket-status-badge.pipe';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { WhitespacePipe } from './pipes/whitespace.pipe';
import { YamlPipe } from './pipes/yaml.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { ToggleClassPipe } from './pipes/toggle-class.pipe';


const PUBLIC_DECLARATIONS = [
  AssetPathPipe,
  ColoredTextChipComponent,
  DoughnutChartComponent,
  LineChartComponent,
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  MultiSelectComponent,
  QueryParamModelDirective,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  RenderLinksInTextComponent,
  RelativeImagePipe,
  RelativeUrlsPipe,
  SelectPagerComponent,
  ShareButtonComponent,
  SortPipe,
  SpinnerComponent,
  TextToColorPipe,
  ToggleClassPipe,
  TicketStatusBadgePipe,
  UrlRewritePipe,
  WhitespacePipe,
  YamlBlockComponent,
  YamlPipe
];

const RELAYED_MODULES = [
  BsDatepickerModule,
  BsDropdownModule,
  FontAwesomeModule,
  FormsModule,
  MarkdownModule,
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
  ]
})
export class CoreModule { }
