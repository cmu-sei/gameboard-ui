import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
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
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { GameCardImageComponent } from './components/game-card-image/game-card-image.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { PagerComponent } from './components/pager/pager.component';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { SelectPagerComponent } from './components/select-pager/select-pager.component';
import { ShareButtonComponent } from './components/share-button/share-button.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { markedOptionsFactory } from './config/marked.config';
import { ModalConfirmDirective } from './components/modal/modal-confirm.directive';
import { AssetPathPipe } from './pipes/asset-path.pipe';
import { FriendlyDateAndTimePipe } from './pipes/friendly-date-and-time.pipe';
import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { PluralizerPipe } from './pipes/pluralizer.pipe';
import { RelativeImagePipe } from './pipes/relative-image.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { TicketStatusBadgePipe } from './pipes/ticket-status-badge.pipe';
import { ToTemplateContextPipe } from './pipes/to-template-context.pipe';
import { ToggleClassPipe } from './pipes/toggle-class.pipe';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { WhitespacePipe } from './pipes/whitespace.pipe';
import { YamlPipe } from './pipes/yaml.pipe';
import { AlertModule } from 'ngx-bootstrap/alert';
import { QueryParamModelDirective } from './directives/query-param-model.directive';
import { CumulativeTimeClockComponent } from './components/cumulative-time-clock/cumulative-time-clock.component';
import { GameboardPerformanceSummaryComponent } from './components/gameboard-performance-summary/gameboard-performance-summary.component';
import { RouterModule } from '@angular/router';
import { ConfirmButtonComponent } from '@/core/components/confirm-button/confirm-button.component';

import { CountdownPipe } from './pipes/countdown.pipe';
import { ClockPipe } from './pipes/clock.pipe';
import { CountdownColorPipe } from './pipes/countdown-color.pipe';
import { FriendlyTimePipe } from './pipes/friendly-time.pipe';
import { ApiUrlPipe } from './pipes/api-url.pipe';
import { MinPipe } from './pipes/min.pipe';
import { RelativeToAbsoluteHrefPipe } from './pipes/relative-to-absolute-href.pipe';
import { SimpleEntitiesToTooltipPipe } from './pipes/simple-entities-to-tooltip.pipe';
import { SponsorToLogoUriPipe } from './pipes/sponsor-to-logo-uri.pipe';
import { SponsorsToLogoUrisPipe } from './pipes/sponsors-to-logo-uris.pipe';
import { SponsorLogoFileNamesToUrisPipe } from './pipes/sponsor-logo-file-names-to-uris.pipe';
import { ChallengeSolutionGuideComponent } from './components/challenge-solution-guide/challenge-solution-guide.component';

const PUBLIC_DECLARATIONS = [
  ApiUrlPipe,
  AssetPathPipe,
  ChallengeSolutionGuideComponent,
  ColoredTextChipComponent,
  ConfirmButtonComponent,
  CumulativeTimeClockComponent,
  DoughnutChartComponent,
  DropzoneComponent,
  FriendlyDateAndTimePipe,
  GameboardPerformanceSummaryComponent,
  GameCardImageComponent,
  LineChartComponent,
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  MultiSelectComponent,
  PagerComponent,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  QueryParamModelDirective,
  ClockPipe,
  CountdownPipe,
  CountdownColorPipe,
  FriendlyTimePipe,
  MinPipe,
  PluralizerPipe,
  RenderLinksInTextComponent,
  RelativeImagePipe,
  RelativeToAbsoluteHrefPipe,
  RelativeUrlsPipe,
  SelectPagerComponent,
  ShareButtonComponent,
  ShortDatePipe,
  SimpleEntitiesToTooltipPipe,
  SortPipe,
  SpinnerComponent,
  SponsorToLogoUriPipe,
  SponsorsToLogoUrisPipe,
  SponsorLogoFileNamesToUrisPipe,
  TextToColorPipe,
  ToggleClassPipe,
  ToTemplateContextPipe,
  TicketStatusBadgePipe,
  UrlRewritePipe,
  WhitespacePipe,
  YamlBlockComponent,
  YamlPipe
];

const RELAYED_MODULES = [
  AlertModule,
  BsDatepickerModule,
  BsDropdownModule,
  FontAwesomeModule,
  FormsModule,
  MarkdownModule,
  NgChartsModule,
  RouterModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule,
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
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
    PopoverModule.forRoot(),
    ...RELAYED_MODULES
  ],
  exports: [
    ...RELAYED_MODULES,
    ...PUBLIC_DECLARATIONS,
    PopoverModule
  ]
})
export class CoreModule { }
